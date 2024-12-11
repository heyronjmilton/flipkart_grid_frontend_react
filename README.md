# React Page Installation Guide

## Overview

This guide will help you install and run frontend of project locally. Follow the steps below to set up your environment and start the application.

---

## Prerequisites

Ensure you have the following installed on your system:

1. **Node.js** (LTS version recommended)
   - Download and install it from [Node.js official website](https://nodejs.org/).
2. **npm** or **yarn** (npm is included with Node.js installation).
   - To check if npm is installed, run:
     ```bash
     npm -v
     ```
   - To install Yarn (optional), run:
     ```bash
     npm install -g yarn
     ```

---

## Installation Steps

1. **Clone the Repository**

   Clone the repository to your local machine using Git:

   ```bash
   git clone <repository-url>
   ```

   Replace `<repository-url>` with the actual URL of the repository.

2. **Navigate to the Project Directory**

   Move into the project's directory:

   ```bash
   cd <project-folder>
   ```

   Replace `<project-folder>` with the directory name of your cloned project.

3. **Install Dependencies**

   Install the required dependencies:

   - Using npm:
     ```bash
     npm install
     ```
   - OR using Yarn:
     ```bash
     yarn install
     ```

4. **Start the Development Server**

   Start the application in development mode:

   - Using npm:
     ```bash
     npm run dev
     ```
   - OR using Yarn:
     ```bash
     yarn dev
     ```

   This command will start a local development server. By default, the app runs at `http://localhost:5173/`.

---

## Build for Production

To create an optimized production build of the application, run:

- Using npm:
  ```bash
  npm run build
  ```
- OR using Yarn:
  ```bash
  yarn build
  ```

This will generate a `dist` directory containing the production-ready files.

---

## Preview Production Build

To preview the production build locally:

- Using npm:
  ```bash
  npm run preview
  ```
- OR using Yarn:
  ```bash
  yarn preview
  ```

---

## Additional Scripts

Here are some additional scripts you can run:

- **Lint the Code:**
  ```bash
  npm run lint
  ```
  OR
  ```bash
  yarn lint
  ```

---

## Troubleshooting

If you encounter issues during installation or setup, consider the following steps:

1. Ensure you have the latest version of Node.js and npm/yarn installed.
2. Delete the `node_modules` folder and reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
   OR
   ```bash
   rm -rf node_modules
   yarn install
   ```
3. Clear npm/yarn cache:
   - For npm:
     ```bash
     npm cache clean --force
     ```
   - For Yarn:
     ```bash
     yarn cache clean
     ```

---
