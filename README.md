# Working Everywhere

> [!CAUTION]
> Work Everywhere is not production-ready, only for a college assignment.

## Overview

The **Working Everywhere** application is a Next.js-based project management dashboard. It helps teams organize tasks, monitor project progress, and search for specific projects.

## Prerequisites

> [!IMPORTANT]
>
> - Ensure you have successfully running the [backend](https://github.com/michaelact/work-everywhere-api?tab=readme-ov-file#prerequisites).

1. **Docker**: Install Docker to run containers locally.
   - [Docker Installation Guide](https://docs.docker.com/get-docker/)

2. **Docker Compose**: Docker Compose simplifies multi-container configurations and is required to set up services.
   - [Docker Compose Installation Guide](https://docs.docker.com/compose/install/)

3. **Git** (optional): Useful for cloning the repository if not directly downloaded.

## Quick Start

1. **Clone the Repository:** Clone the project repository to your local machine.

    ```bash
    git clone https://github.com/michaelact/work-everywhere
    cd work-everywhere
    ```

2. **Run with Docker Compose:** Use Docker Compose to set up and deploy the application.

    ```bash
    docker compose up -d --build
    ```

    This command will build and start the application (Next.js) along with any required services.

3. **Access the Application:** Open a browser and navigate to http://localhost:3000/login (or your configured port) to start using the dashboard.

> [!NOTE]
>
> - Use `user@example.com` and `SangatTerlindungi150` as the default login credentials for accessing the dashboard.
