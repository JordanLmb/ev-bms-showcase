
import json
import math

class Cell:
    def __init__(self, cell_id, voltage=3.7, temp=25.0):
        self.id = cell_id
        self.voltage = voltage
        self.temp = temp
        self.soc = 0.5  # 50%
        self.capacity_ah = 2.5
        self.is_balancing = False
        self.internal_resistance = 0.05 # Ohms

    def update(self, current, dt):
        # Coulomb Counting for SOC (ACCELERATED for demo - 100x faster)
        # In real life this would be hours, but for demo we speed it up
        acceleration_factor = 100.0
        dhz = 3600.0 / acceleration_factor
        self.soc += (current * dt) / (self.capacity_ah * dhz)
        self.soc = max(0.0, min(1.0, self.soc))

        # OCV model: V = V_ocv(soc) + I * R
        v_ocv = 3.0 + (1.2 * self.soc)  # Linear approx 3.0V to 4.2V
        self.voltage = v_ocv + (current * self.internal_resistance)
        
        # Temperature model (ACCELERATED for demo)
        power_heat = (current ** 2) * self.internal_resistance
        cooling = (self.temp - 25.0) * 0.1  # Faster cooling
        self.temp += (power_heat * 0.5 * dt) - (cooling * dt)  # 50x faster heating
        self.temp = max(20.0, min(100.0, self.temp))  # Clamp

class BMS:
    def __init__(self):
        self.cells = [Cell(i) for i in range(4)]
        self.target_balance_voltage = 0.0
        self.contactors_closed = True
        self.faults = []
        self.charger_amps = 0.0
        self.load_amps = 0.0
        self.fan_duty = 0.0
        self.sabotage_mode = False  # When True, disables overtemp protection (for demo)

    def get_state_json(self):
        pack_voltage = sum(c.voltage for c in self.cells)
        pack_current = self.charger_amps - self.load_amps
        avg_temp = sum(c.temp for c in self.cells) / len(self.cells)
        pack_soc = sum(c.soc for c in self.cells) / len(self.cells)

        state = {
            "timestamp": 0,
            "cells": [
                {
                    "id": c.id,
                    "voltage": round(c.voltage, 3),
                    "temp": round(c.temp, 1),
                    "isBalancing": c.is_balancing
                } for c in self.cells
            ],
            "packVoltage": round(pack_voltage, 2),
            "packCurrent": round(pack_current, 2),
            "packTemp": round(avg_temp, 1),
            "soc": round(pack_soc * 100, 1),
            "fanDuty": self.fan_duty,
            "faults": self.faults,
            "contactorsClosed": self.contactors_closed
        }
        return json.dumps(state)

    def tick(self, dt):
        net_current = self.charger_amps - self.load_amps
        
        # Safety Check Loop
        self.faults = []
        max_voltage = max(c.voltage for c in self.cells)
        min_voltage = min(c.voltage for c in self.cells)
        max_temp = max(c.temp for c in self.cells)

        if max_voltage > 4.25:
            self.faults.append("OVERVOLTAGE")
        if min_voltage < 2.5:
            self.faults.append("UNDERVOLTAGE")
        # Overtemp protection - DISABLED when sabotage_mode is True (for demo)
        if max_temp > 60.0 and not self.sabotage_mode:
            self.faults.append("OVERTEMP")

        if self.faults:
            self.contactors_closed = False
        
        if self.contactors_closed:
            # Balancing Logic (Simple passive)
            if self.charger_amps > 0 and max_voltage > 4.0:
               for cell in self.cells:
                   if cell.voltage > min_voltage + 0.05:
                       cell.is_balancing = True
                   else:
                       cell.is_balancing = False
            else:
                for cell in self.cells: cell.is_balancing = False
            
            # Update cell physics
            for cell in self.cells:
                cell.update(net_current, dt)
        
        # Thermal spreading (heat propagates to neighbors even when contactors open)
        self._thermal_spread(dt)
    
    def _thermal_spread(self, dt):
        """Simulate heat spreading between adjacent cells"""
        temps = [c.temp for c in self.cells]
        for i, cell in enumerate(self.cells):
            # Heat flows from hot to cold neighbors
            neighbors = []
            if i > 0: neighbors.append(temps[i-1])
            if i < 3: neighbors.append(temps[i+1])
            
            if neighbors:
                avg_neighbor = sum(neighbors) / len(neighbors)
                # Heat transfer coefficient
                transfer = (avg_neighbor - cell.temp) * 0.05 * dt
                cell.temp += transfer

    def update_control(self, control_json):
        data = json.loads(control_json)
        if 'chargerAmps' in data: self.charger_amps = float(data['chargerAmps'])
        if 'loadAmps' in data: self.load_amps = float(data['loadAmps'])
        if 'fanDuty' in data: self.fan_duty = float(data['fanDuty'])
        
        # Fault Injection - More dramatic effects!
        if 'injectFault' in data:
            fault = data['injectFault']
            if fault == 'OVERVOLTAGE':
                # Overcharge Cell 0
                self.cells[0].voltage = 4.5
                self.cells[0].soc = 1.0
            elif fault == 'OVERTEMP':
                # Thermal event - Cell 0 gets hot, spreads to neighbors
                self.cells[0].temp = 80.0
                self.cells[1].temp = 50.0  # Adjacent cell feels heat
            elif fault == 'UNDERVOLTAGE':
                # Deep discharge Cell 2
                self.cells[2].voltage = 2.3
                self.cells[2].soc = 0.0
            elif fault == 'SHORT_CIRCUIT':
                # Short circuit - massive current, all cells affected
                for c in self.cells:
                    c.temp += 30.0  # All cells heat up
            elif fault == 'SABOTAGE':
                # DEMO FEATURE: Disable overtemp protection to show test failures
                self.sabotage_mode = True
                # Also inject an overtemp to trigger the broken state
                self.cells[0].temp = 80.0
            elif fault == 'NONE':
                # Full system reset
                self.faults = []
                self.contactors_closed = True
                self.load_amps = 0  # Reset load to prevent re-fault
                self.charger_amps = 0
                self.sabotage_mode = False  # Restore safety systems
                for c in self.cells: 
                    c.voltage = 3.7
                    c.temp = 25.0
                    c.soc = 0.5
                    c.is_balancing = False

# Singleton instance
bms = BMS()

def tick(dt_ms):
    bms.tick(dt_ms / 1000.0)
    return bms.get_state_json()

def update_control(json_str):
    bms.update_control(json_str)
