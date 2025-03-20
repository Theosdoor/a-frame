# VR Glucose Monitor Simulation

This project is a proof of concept for a VR simulation that displays real-time glucose levels while a user is exercising in a virtual environment. It uses A-Frame to create a VR experience with a floating glucose monitor that updates automatically.

## Features

- Real-time glucose monitoring display in VR
- Visual feedback for glucose levels outside the healthy range
- Fitness video integration for workout guidance
- Demo controls to simulate different glucose scenarios

## Files

- `index.html` - Main HTML file for the VR application
- `glucose-component.js` - A-Frame component for the glucose monitor
- `main.js` - JavaScript to handle glucose simulation and control events

## How It Works

1. The application loads a fitness video in VR space
2. A glucose monitor is displayed in the user's field of view
3. The monitor shows:
   - Connection status
   - Current glucose level
   - Healthy range parameters
   - Alerts when glucose is outside the healthy range
4. Glucose levels are simulated to change over time, mimicking real-world variations

## Demo Controls

The simulation includes buttons to test different scenarios:

- **Simulate Low Glucose**: Sets the glucose level below the healthy range
- **Simulate Normal Glucose**: Sets the glucose level within the healthy range
- **Simulate High Glucose**: Sets the glucose level above the healthy range
- **Toggle Connection**: Simulates connecting/disconnecting the glucose monitoring device

## Implementation Details

The glucose monitor is implemented as an A-Frame component (`glucose-monitor`) that manages its own DOM elements and styling. The monitor includes:

- Status indicator
- Current glucose value display
- Healthy range information
- Visual alert notifications for out-of-range values

## Future Enhancements

- Integration with real glucose monitoring devices
- More advanced UI with graphs and trends
- Personalized workout recommendations based on glucose levels
- More immersive VR environment with interactive elements
- Game mechanics that respond to glucose levels

## Setup

1. Clone this repository
2. Open `index.html` in a web browser that supports WebVR
3. For the best experience, use a VR headset

## Requirements

- A modern web browser with WebVR support
- A-Frame 1.6.0 or higher