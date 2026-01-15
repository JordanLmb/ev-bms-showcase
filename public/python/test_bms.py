"""
BMS HIL Test Suite - Professional QA Automation Framework
==========================================================
This module demonstrates pytest-style automated testing for a Battery Management System.
Designed to showcase QA Automation skills for OPAL-RT Technologies.

Test Categories:
    - Safety Protection Tests (Overvoltage, Overtemp, Undervoltage)
    - Functional Tests (Cell Balancing, Contactor Control)
    - Boundary Tests (Parametrized edge cases)
    
Author: Jordan LMB
Target: OPAL-RT QA Automation Developer Role
"""

import json
from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum

# ============================================================================
# TEST FRAMEWORK INFRASTRUCTURE
# ============================================================================

class TestResult(Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    SKIP = "SKIP"

@dataclass
class TestCase:
    """Represents a single test case result."""
    id: str
    name: str
    category: str
    result: TestResult
    message: str
    expected: Any
    actual: Any
    duration_ms: float = 0.0

class BMSTestRunner:
    """
    Professional test runner with reporting capabilities.
    Mimics pytest behavior for browser-based execution.
    """
    
    def __init__(self, bms_instance):
        self.bms = bms_instance
        self.results: List[TestCase] = []
        self.setup_state = {}
        
    def setup(self):
        """Reset BMS to known-good state BEFORE each test."""
        # Always start from a clean, healthy state
        for c in self.bms.cells:
            c.voltage = 3.7
            c.temp = 25.0
            c.soc = 0.5
            c.is_balancing = False
        self.bms.faults = []
        self.bms.contactors_closed = True
        self.bms.charger_amps = 0
        self.bms.load_amps = 0
    
    def teardown(self):
        """Reset BMS to known-good state AFTER each test."""
        # Restore to healthy state for next test
        for c in self.bms.cells:
            c.voltage = 3.7
            c.temp = 25.0
            c.soc = 0.5
            c.is_balancing = False
        self.bms.faults = []
        self.bms.contactors_closed = True
        self.bms.charger_amps = 0
        self.bms.load_amps = 0
    
    def assert_true(self, condition: bool, message: str) -> bool:
        """Assert helper with descriptive messaging."""
        if not condition:
            raise AssertionError(message)
        return True
    
    def assert_equals(self, expected, actual, message: str) -> bool:
        """Assert equality with detailed error."""
        if expected != actual:
            raise AssertionError(f"{message}. Expected: {expected}, Got: {actual}")
        return True
    
    def assert_in(self, item, container, message: str) -> bool:
        """Assert membership."""
        if item not in container:
            raise AssertionError(f"{message}. '{item}' not found in {container}")
        return True
    
    def run_test(self, test_id: str, name: str, category: str, test_fn):
        """Execute a single test with setup/teardown."""
        self.setup()
        result = TestResult.PASS
        message = "OK"
        expected = None
        actual = None
        
        try:
            test_fn()
        except AssertionError as e:
            result = TestResult.FAIL
            message = str(e)
        except Exception as e:
            result = TestResult.FAIL
            message = f"Unexpected error: {e}"
        finally:
            self.teardown()
        
        self.results.append(TestCase(
            id=test_id,
            name=name,
            category=category,
            result=result,
            message=message,
            expected=expected,
            actual=actual
        ))
    
    def get_report(self) -> Dict:
        """Generate test report in structured format."""
        passed = sum(1 for r in self.results if r.result == TestResult.PASS)
        failed = sum(1 for r in self.results if r.result == TestResult.FAIL)
        
        return {
            "summary": {
                "total": len(self.results),
                "passed": passed,
                "failed": failed,
                "pass_rate": f"{(passed/len(self.results)*100):.1f}%" if self.results else "N/A"
            },
            "tests": [
                {
                    "id": r.id,
                    "name": r.name,
                    "category": r.category,
                    "result": r.result.value,
                    "message": r.message
                }
                for r in self.results
            ]
        }


# ============================================================================
# TEST CASES - SAFETY PROTECTION
# ============================================================================

def test_overvoltage_protection(runner: BMSTestRunner):
    """
    TC-SAFE-001: Overvoltage Protection
    
    Requirement: BMS shall open contactors when any cell exceeds 4.25V
    
    Preconditions:
        - System in normal operating state
        - All cells within nominal voltage range
    
    Test Steps:
        1. Inject overvoltage condition on Cell 0 (4.5V)
        2. Execute one simulation tick
        3. Verify OVERVOLTAGE fault is raised
        4. Verify contactors are opened (safety shutdown)
    """
    def test():
        # Inject fault
        runner.bms.cells[0].voltage = 4.5
        
        # Execute physics
        runner.bms.tick(0.1)
        
        # Verify protection activated
        runner.assert_in("OVERVOLTAGE", runner.bms.faults, 
            "Overvoltage fault not detected")
        runner.assert_equals(False, runner.bms.contactors_closed,
            "Contactors should open on overvoltage")
    
    runner.run_test("TC-SAFE-001", "Overvoltage Protection", "Safety", test)


def test_thermal_runaway_protection(runner: BMSTestRunner):
    """
    TC-SAFE-002: Thermal Runaway Protection
    
    Requirement: BMS shall open contactors when any cell exceeds 60°C
    
    Test Steps:
        1. Inject overtemperature condition on Cell 0 (75°C)
        2. Execute one simulation tick
        3. Verify OVERTEMP fault is raised
        4. Verify contactors are opened
    """
    def test():
        runner.bms.cells[0].temp = 75.0
        runner.bms.tick(0.1)
        
        runner.assert_in("OVERTEMP", runner.bms.faults,
            "Overtemp fault not detected at 75°C")
        runner.assert_equals(False, runner.bms.contactors_closed,
            "Contactors should open on thermal fault")
    
    runner.run_test("TC-SAFE-002", "Thermal Runaway Protection", "Safety", test)


def test_undervoltage_protection(runner: BMSTestRunner):
    """
    TC-SAFE-003: Undervoltage Protection
    
    Requirement: BMS shall open contactors when any cell drops below 2.5V
    """
    def test():
        runner.bms.cells[0].voltage = 2.3
        runner.bms.tick(0.1)
        
        runner.assert_in("UNDERVOLTAGE", runner.bms.faults,
            "Undervoltage fault not detected at 2.3V")
        runner.assert_equals(False, runner.bms.contactors_closed,
            "Contactors should open on undervoltage")
    
    runner.run_test("TC-SAFE-003", "Undervoltage Protection", "Safety", test)


# ============================================================================
# TEST CASES - FUNCTIONAL
# ============================================================================

def test_cell_balancing_activation(runner: BMSTestRunner):
    """
    TC-FUNC-001: Cell Balancing Activation
    
    Requirement: Passive balancing shall activate on highest-voltage cell
                 when charging and max cell voltage > 4.0V
    
    Test Steps:
        1. Set charger current to 5A (charging mode)
        2. Set Cell 0 voltage to 4.1V (above threshold)
        3. Set Cell 1 voltage to 3.9V (below threshold)
        4. Execute simulation tick
        5. Verify Cell 0 is balancing, Cell 1 is not
    """
    def test():
        runner.bms.charger_amps = 5.0
        runner.bms.cells[0].voltage = 4.1
        runner.bms.cells[1].voltage = 3.9
        runner.bms.cells[2].voltage = 3.9
        runner.bms.cells[3].voltage = 3.9
        
        runner.bms.tick(0.1)
        
        runner.assert_true(runner.bms.cells[0].is_balancing,
            "High-voltage cell should be balancing")
        runner.assert_true(not runner.bms.cells[1].is_balancing,
            "Low-voltage cell should NOT be balancing")
    
    runner.run_test("TC-FUNC-001", "Cell Balancing Activation", "Functional", test)


def test_contactor_state_on_fault_clear(runner: BMSTestRunner):
    """
    TC-FUNC-002: Contactor Recovery After Fault Clear
    
    Requirement: System should allow manual reset after fault condition is cleared
    """
    def test():
        # Trigger fault
        runner.bms.cells[0].voltage = 4.5
        runner.bms.tick(0.1)
        runner.assert_equals(False, runner.bms.contactors_closed, "Pre-check failed")
        
        # Clear fault condition
        runner.bms.cells[0].voltage = 3.7
        runner.bms.faults = []
        runner.bms.contactors_closed = True  # Manual reset
        
        runner.bms.tick(0.1)
        
        runner.assert_equals(True, runner.bms.contactors_closed,
            "Contactors should remain closed after fault clear")
    
    runner.run_test("TC-FUNC-002", "Fault Recovery", "Functional", test)


# ============================================================================
# TEST CASES - BOUNDARY (Parametrized Style)
# ============================================================================

def test_voltage_boundary_conditions(runner: BMSTestRunner):
    """
    TC-BOUND-001: Voltage Boundary Testing
    
    Parametrized test for voltage thresholds:
        - 4.24V: No fault (just under limit)
        - 4.25V: No fault (at limit)  
        - 4.26V: Fault (just over limit)
    """
    test_params = [
        {"voltage": 4.24, "expect_fault": False, "desc": "Just under limit"},
        {"voltage": 4.25, "expect_fault": False, "desc": "At limit"},
        {"voltage": 4.26, "expect_fault": True, "desc": "Just over limit"},
    ]
    
    for i, params in enumerate(test_params):
        def make_test(p):
            def test():
                runner.bms.cells[0].voltage = p["voltage"]
                runner.bms.tick(0.1)
                
                has_fault = "OVERVOLTAGE" in runner.bms.faults
                runner.assert_equals(p["expect_fault"], has_fault,
                    f"Voltage {p['voltage']}V - {p['desc']}")
            return test
        
        runner.run_test(
            f"TC-BOUND-001-{i+1}",
            f"Voltage Boundary ({params['desc']})",
            "Boundary",
            make_test(params)
        )


# ============================================================================
# MAIN RUNNER
# ============================================================================

    """
    Execute the full test suite and return results.
    Called by the Pyodide worker.
    """
    # Create ISOLATED instance for testing
    # This ensures tests don't interfere with the live visual simulation
    test_instance = BMS()
    runner = BMSTestRunner(test_instance)
    
    # Safety Tests
    test_overvoltage_protection(runner)
    test_thermal_runaway_protection(runner)
    test_undervoltage_protection(runner)
    
    # Functional Tests
    test_cell_balancing_activation(runner)
    test_contactor_state_on_fault_clear(runner)
    
    # Boundary Tests
    test_voltage_boundary_conditions(runner)
    
    return runner.get_report()
