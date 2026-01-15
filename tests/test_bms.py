import unittest
import sys
import os
import json

# Add public/python to path so we can import bms
sys.path.append(os.path.join(os.getcwd(), 'public', 'python'))

from bms import bms, tick, update_control

class TestBMSLogic(unittest.TestCase):
    def setUp(self):
        # Reset BMS state
        update_control(json.dumps({'injectFault': 'NONE', 'chargerAmps': 0, 'loadAmps': 0, 'fanDuty': 0}))

    def test_initial_state(self):
        state_json = bms.get_state_json()
        state = json.loads(state_json)
        self.assertEqual(len(state['cells']), 4)
        self.assertTrue(state['contactorsClosed'])
        self.assertEqual(state['packCurrent'], 0)

    def test_charging(self):
        # Charge at 10A
        update_control(json.dumps({'chargerAmps': 10}))
        
        # Tick for 1 second
        tick(1000)
        
        state = json.loads(bms.get_state_json())
        self.assertEqual(state['packCurrent'], 10)
        self.assertTrue(state['soc'] > 50.0) # Should increase from 50%

    def test_overvoltage_fault(self):
        # Inject Overvoltage
        update_control(json.dumps({'injectFault': 'OVERVOLTAGE'}))
        
        tick(100)
        
        state = json.loads(bms.get_state_json())
        self.assertIn("OVERVOLTAGE", state['faults'])
        self.assertFalse(state['contactorsClosed'])

if __name__ == '__main__':
    unittest.main()
