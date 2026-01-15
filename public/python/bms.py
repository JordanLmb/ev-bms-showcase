
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
        # Coulomb Counting for SOC
        # current is positive for charging, negative for discharge
        # dSOC = (I * dt) / (Capacity * 3600)
        dhz = 3600.0
        self.soc += (current * dt) / (self.capacity_ah * dhz)
        self.soc = max(0.0, min(1.0, self.soc))

        # Simple OCV model
        # V = V_ocv(soc) + I * R
        v_ocv = 3.0 + (1.2 * self.soc) # Linear approx 3.0V to 4.2V
        self.voltage = v_ocv + (current * self.internal_resistance)
        
        # Temp model (simple heating)
        # Power = I^2 * R
        power_heat = (current ** 2) * self.internal_resistance
        # Cooling coefficient (passive)
        cooling = (self.temp - 25.0) * 0.05
        
        self.temp += (power_heat * 0.01 * dt) - (cooling * dt)

class BMS:
    def __init__(self):
        self.cells = [Cell(i) for i in range(4)]
        self.target_balance_voltage = 0.0
        self.contactors_closed = True
        self.faults = []
        self.charger_amps = 0.0
        self.load_amps = 0.0
        self.fan_duty = 0.0

    def get_state_json(self):
        pack_voltage = sum(c.voltage for c in self.cells)
        pack_current = self.charger_amps - self.load_amps
        avg_temp = sum(c.temp for c in self.cells) / len(self.cells)
        pack_soc = sum(c.soc for c in self.cells) / len(self.cells)

        state = {
            "timestamp": 0, # To be filled by JS or kept simplified
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
        if max_temp > 60.0:
            self.faults.append("OVERTEMP")

        if self.faults:
            self.contactors_closed = False
        
        if self.contactors_closed:
            for cell in self.cells:
                cell.update(net_current, dt)
                
            # Balancing Logic (Simple passive)
            if self.charger_amps > 0 and max_voltage > 4.0:
               for cell in self.cells:
                   if cell.voltage > min_voltage + 0.05:
                       cell.is_balancing = True
                       # Balancing bleeds current (simulate by slightly reducing effective charging current for this cell)
                       # For viz only
                   else:
                       cell.is_balancing = False
            else:
                for cell in self.cells: cell.is_balancing = False

    def update_control(self, control_json):
        data = json.loads(control_json)
        if 'chargerAmps' in data: self.charger_amps = float(data['chargerAmps'])
        if 'loadAmps' in data: self.load_amps = float(data['loadAmps'])
        if 'fanDuty' in data: self.fan_duty = float(data['fanDuty'])
        
        # Fault Injection
        if 'injectFault' in data:
            fault = data['injectFault']
            if fault == 'OVERVOLTAGE':
                self.cells[0].voltage = 4.5
            elif fault == 'OVERTEMP':
                self.cells[0].temp = 80.0
            elif fault == 'NONE':
                self.faults = []
                self.contactors_closed = True
                for c in self.cells: 
                    c.voltage = 3.7
                    c.temp = 25.0

# Singleton instance
bms = BMS()

def tick(dt_ms):
    bms.tick(dt_ms / 1000.0)
    return bms.get_state_json()

def update_control(json_str):
    bms.update_control(json_str)

