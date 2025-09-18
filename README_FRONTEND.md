# PIMS Frontend

This is the frontend application for the Pharmacy Management System (PIMS). It's a Tauri desktop application that communicates with a remote REST API backend instead of using a local Rust backend.

## Changes Made

### Backend Changes

- Removed local Rust backend logic from `src-tauri` (kept minimal Tauri shell)
- Removed `pims.db` SQLite database file
- Updated Tauri app to use HTTP requests instead of local commands
- Updated `vite.config.ts` to work with Tauri

### API Layer Conversion

- Converted `src/api/tauriClient.ts` to use HTTP client instead of Tauri invoke
- Updated all API functions to use REST API endpoints
- Removed userId handling from API calls (now handled by authentication headers)
- Added comprehensive command mapping for all Tauri commands to REST endpoints

### Configuration

- Updated `package.json` name to `pims-frontend`
- Changed development server port to 3001
- Added environment variable support for API URL configuration

## API Endpoints

The frontend now expects a REST API backend with the following endpoints:

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products

- `GET /api/products/drugs` - List drugs
- `POST /api/products/drugs` - Create drug
- `PUT /api/products/drugs` - Update drug
- `DELETE /api/products/drugs` - Delete drug
- `GET /api/products/categories` - List categories
- `POST /api/products/categories` - Create category
- `PUT /api/products/categories` - Update category
- `DELETE /api/products/categories` - Delete category

### Inventory

- `GET /api/inventory/batches` - List batches
- `POST /api/inventory/batches` - Create batch
- `PUT /api/inventory/batches` - Update batch
- `DELETE /api/inventory/batches` - Delete batch
- `GET /api/inventory/transactions` - List transactions
- `POST /api/inventory/transactions` - Create transaction
- `DELETE /api/inventory/transactions` - Delete transaction

### Orders

- `GET /api/orders/purchase-orders` - List purchase orders
- `POST /api/orders/purchase-orders` - Create purchase order
- `PUT /api/orders/purchase-orders` - Update purchase order
- `DELETE /api/orders/purchase-orders` - Delete purchase order
- `GET /api/orders/purchase-order-items` - List purchase order items
- `POST /api/orders/purchase-order-items` - Create purchase order item
- `PUT /api/orders/purchase-order-items` - Update purchase order item
- `DELETE /api/orders/purchase-order-items` - Delete purchase order item

### Users

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users` - Update user
- `DELETE /api/users` - Delete user

### Suppliers

- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers` - Update supplier
- `DELETE /api/suppliers` - Delete supplier

### Locations

- `GET /api/locations` - List locations
- `POST /api/locations` - Create location
- `PUT /api/locations` - Update location
- `DELETE /api/locations` - Delete location
- `GET /api/locations/batches` - List batches in location
- `GET /api/locations/summary` - Locations summary

### Notifications

- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `DELETE /api/notifications` - Delete notification

### Analytics

- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/distribution-by-category` - Get distribution by category
- `GET /api/analytics/monthly-stocked-vs-sold` - Get monthly stocked vs sold data
- `GET /api/analytics/metrics-summary` - Get metrics summary

### Audit

- `GET /api/audit/logs` - List audit logs
- `POST /api/audit/logs` - Create audit log
- `DELETE /api/audit/logs` - Delete audit log

### General Configs

- `GET /api/configs` - List general configs
- `POST /api/configs` - Create general config
- `PUT /api/configs` - Update general config
- `DELETE /api/configs` - Delete general config

## Environment Variables

Set the following environment variable to configure the API URL:

- `REACT_APP_API_URL` - The base URL for the REST API (default: http://localhost:3000/api)

## Running the Application

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Tauri development server:

   ```bash
   npm run tauri:dev
   ```

3. Build the Tauri application:

   ```bash
   npm run tauri:build
   ```

## Backend Requirements

The frontend expects a NestJS backend running on port 3000 with the API endpoints listed above. The backend should:

- Handle authentication with JWT tokens
- Support CORS for the frontend domain
- Return data in the same format as the original Tauri backend
- Include proper error handling and status codes

## Authentication

The frontend expects the backend to return a session object with a `token` field for authentication. The token will be sent in the `Authorization` header as `Bearer <token>` for all authenticated requests.
