# FundVue

FundVue is an information visualization project designed to provide insights into hedge fund holdings and their investments in various stocks and industries. The platform transforms publicly available data from SEC Form 13F filings into intuitive, interactive visualizations that help users explore and understand fund behaviors, stock trends, and sector allocations.

## Features

### Core Functionalities
- **Fund View**:
  - Visualize a hedge fund's stock holdings over time using a line chart.
  - Explore a fund's sector-wise allocation in a specific quarter with a spiderweb chart.
  - View a bar chart showing a fund's stock holdings in a selected quarter.

- **Stock View**:
  - Analyze stock holdings by various hedge funds using a bar chart.
  - Examine how different funds have held a specific stock over time using a line chart.

- **Interactive Elements**:
  - Sliders to adjust time frames for line charts.
  - Search functionality to filter stocks and funds.
  - Mouse-over interactions to display detailed values of data points.

## Technologies Used
- **Frontend**: Next.js for a responsive, interactive web interface.
- **Backend**: Node.js with serverless functions integrated into Next.js.
- **Database**: MySQL for storing and querying hedge fund data.
- **Data Visualization**: D3.js for creating dynamic and interactive charts.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- pnpm package manager
- MySQL database server

### Steps
1. **Database Setup**:
   - Place the EDGARDATASOURCE folder with the provided tables into the `database` directory.
   - Obtain and clean the NASDAQ industry CSV and CUSIP-to-ticker CSV using the provided Python script.

2. **Environment Configuration**:
   - Configure `.env` for backend database connection with credentials.
   - Configure `.env.local` in the frontend folder with host, user, password, and database name.

3. **Run the Application**:
   - Navigate to the project directory and install dependencies:
     ```bash
     pnpm install
     ```
   - Start the development server:
     ```bash
     pnpm run dev
     ```
   - Access the application at `http://localhost:3000`.

## Visualizations

### Fund View
- **Line Chart**: Displays a fund's stock holdings over time.
- **Bar Chart**: Shows a fund's holdings in various stocks for a selected quarter.
- **Spiderweb Chart**: Illustrates a fund's sector-wise allocation for a specific quarter.

### Stock View
- **Bar Chart**: Depicts hedge fund holdings of a specific stock for a selected quarter.
- **Line Chart**: Visualizes how hedge funds have held a stock over time.

## Challenges
- **Data Volume**: Managed over 68 million records from SEC filings, reduced to 35 million through preprocessing.
- **Data Inconsistencies**: Addressed missing or incorrect CUSIP mappings and duplicate entries.
- **Performance Optimization**: Implemented database indexing, optimized SQL queries, and eliminated unnecessary middleware.

## Areas for Improvement
- **Assets Under Management (AUM)**: Integration of AUM data to provide additional insights.
- **Additional Visualizations**: Heat maps and enhanced multi-fund comparisons.
- **Mobile Optimization**: Improve UI/UX for mobile platforms.
- **Enhanced Interactions**: Highlighting and tooltip features for better user experience.

## Workload Distribution
This project was a collaborative effort:
- **Backend**: Ivan Aristy led the setup of the database and backend logic.
- **Frontend Visualizations**: Austin Huang, Eli Borovoy, and Ian Davoren developed and refined the interactive charts and interfaces.
- **Data Management**: Ivan and Eli worked extensively on database cleaning and optimization.

## License
This project is licensed under the [MIT License](LICENSE).
