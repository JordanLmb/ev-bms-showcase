# Virtual BMS HIL Simulator

> **A professional demonstration of QA Automation, Python, and Real-time Systems.**

![Status](https://img.shields.io/badge/Status-Live-emerald)
![Tech](https://img.shields.io/badge/Stack-Next.js_·_Pyodide_·_Zustand-purple)

This project simulates a **Battery Management System (BMS)** in a web browser. It uses **Pyodide** to run actual Python BMS control logic inside a Web Worker, simulating a "Hardware-in-the-Loop" (HIL) environment where the frontend acts as the physical plant and the Python code acts as the embedded controller.

## 🚀 Live Demo

**Access the Simulator:** `https://jordanlmb.com/bms`

Key Features:
- **Voltage/Temp Telemetry:** Real-time 60Hz physics simulation.
- **Fault Injection:** Trigger Overvoltage, Overtemp, and Short Circuits.
- **Automated Testing:** "Sabotage Mode" proves the test suite catches failures.
- **Isolation:** Tests run in a separate instance to avoid disrupting the visual demo.

---

## 📚 Terminology Glossary

If you are new to EV Battery Systems, here is a quick guide to the terms used in this simulator:

| Term | Full Name | Definition |
| :--- | :--- | :--- |
| **BMS** | Battery Management System | The "brain" of the battery pack. It monitors voltage and temperature, estimates state of charge, and protects the battery from unsafe conditions. |
| **HIL** | Hardware-in-the-Loop | A testing technique where real controllers are tested against a simulated physical system. In this project, the "Virtual HIL" simulates the battery physics for the BMS logic to control. |
| **HV** | High Voltage | Refers to the main traction battery circuit. When safety checks fail, the BMS opens the "HV Contactors" (relays) to disconnect the battery and prevent damage. |
| **SoC** | State of Charge | The remaining energy in the battery, expressed as a percentage (0% = empty, 100% = full). |
| **Cell Balancing** | - | The process of equalizing the voltage of individual cells in a pack. If one cell is higher than others, the BMS discharges it slightly ('passive balancing') to match the rest. |
| **Contactor** | - | A heavy-duty switch used to connect or disconnect the high-voltage battery from the vehicle or load. |

---

## 🛠️ Technical Architecture

This application mimics a real embedded system architecture:

1.  **The "Plant" (Frontend):**
    - Built with **Next.js** and **Tailwind CSS**.
    - Visualizes the state of the battery (Voltage, Temp, Contactors).
    - Sends inputs (Load Current, Fault Injections) to the backend.

2.  **The "Controller" (Backend/Worker):**
    - Runs in a **Web Worker** using **Pyodide** (WASM Python).
    - Executes the `bms.py` script at **10Hz** (100ms interval).
    - Performs safety checks (Overvoltage > 4.25V, Overtemp > 60°C).
    - If a fault is detected, it "opens" the contactors (sets `contactors_closed = False`).

3.  **The Test Runner:**
    - A dedicated Python script (`test_bms.py`) running `pytest`-style assertions.
    - runs **automatically** whenever a fault is injected to verify system integrity.
    - Decoupled from the main simulation to verify logic without resetting the visual state.

## 🛡️ QA Automation & HIL Testing Architecture

This simulator was designed to demonstrate **advanced QA Automation skills** relevant to Hardware-in-the-Loop environments. The testing framework (located in `public/python/test_bms.py`) mimics a professional embedded testing workflow.

### 1. Custom Python Test Runner
Instead of relying on standard web assertion libraries, this project implements a **custom Python Test Runner** (`BMSTestRunner` class) that runs *inside* the browser's Web Worker. This demonstrates:
- **Pytest-style Assertions:** `assert_equals`, `assert_in`, `assert_true`.
- **Setup/Teardown Fixtures:** Ensures a known-good state (Voltage=3.7V, Temp=25°C) before every test.
- **Reporting:** Generates structured JSON reports with Pass/Fail rates and failure messages.

### 2. HIL Simulation (Physics-First Testing)
The tests do not just check static values; they simulate the passage of time and physics response.
* **Example:** The `Overvoltage Protection` test doesn't just check a flag. It:
    1.  Sets a cell to 4.5V (Logic Input).
    2.  Advances the simulation clock by 100ms (`runner.bms.tick(0.1)`).
    3.  Verifies the BMS controller responded by opening the contactors (Logic Output).

### 3. Test Isolation Strategy
To prevent "Flaky Tests" caused by shared state:
- The main visual simulation runs on one global `BMS()` instance.
- **Every time you click 'Run Tests'**, the worker instantiates a **fresh, isolated `BMS()` instance** specifically for the test suite.
- This ensures that ongoing visual interactions (like user injected faults) do not interfere with the automated regression suite, preserving test reliability.

### 4. "Sabotage Mode" (Negative Testing)
A unique feature of this project is the **Sabotage** button.
- **Concept:** It intentionally breaks the BMS safety logic (disabling overvoltage/overtemp checks).
- **Goal:** To verify that the **Test Suite correctly catches the failure**.
- When Sabotage is ON, the tests *must* fail. This validates the "Watchdog" function of the QA suite itself.

---

## 💻 Running Locally

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

3.  **Open Browser:**
    Navigate to `http://localhost:3000/bms`

## 🧪 Testing the Simulator

1.  **Normal Operation:**
    - Increase the **LOAD** slider.
    - Watch the Voltage drop (Sag) and Temperature rise.
    - Watch the **SoC** decrease over time.

2.  **Fault Injection:**
    - Click **OVERCHARGE**.
    - Watch Cell Voltage spike > 4.25V.
    - Observe `Safety Shutdown` message in console.
    - Observe **HV DISCONNECTED** status.

3.  **Sabotage Mode (QA Demo):**
    - Click **SABOTAGE** (Disables BMS safety protections).
    - Inject **OVERHEAT**.
    - Notice the system *fails* to shut down (Temperature > 60°C but HV stays Active).
    - Notice the **Test Suite** reports failures (❌ Thermal Runaway Protection).

---

*Created by Jordan LMB for Portfolio Showcase*
