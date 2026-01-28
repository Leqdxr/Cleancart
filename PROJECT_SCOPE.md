# CleanCart - Project Scope Documentation

## Project Overview

**CleanCart** is a full-stack e-commerce comparison platform designed to help users compare computer accessories across multiple stores before making a purchase. The platform aggregates pricing, availability, and delivery information from various retailers, enabling users to make informed purchasing decisions by viewing total cart costs, delivery fees, and stock availability in one centralized location.

---

## 1. Project Objectives

### Primary Goals
- **Price Comparison**: Enable users to compare prices of computer accessories across multiple partner stores in real-time
- **Cart Optimization**: Provide intelligent cart totaling that calculates complete purchase costs including delivery fees for each store
- **Transparency**: Deliver clear visibility into product availability, delivery times, and total costs before checkout
- **User Management**: Implement secure authentication and role-based access control for regular users and administrators

### Target Audience
- Computer enthusiasts building custom setups
- Gamers looking for peripherals and accessories
- Professionals purchasing office equipment
- Price-conscious consumers seeking the best deals

---

## 2. Scope of Work

### 2.1 In-Scope Features

#### Frontend Application (React + Vite)
- **User Interface Pages**:
  - Homepage with product showcase and feature highlights
  - User registration and login system
  - Product catalog with browsing and search capabilities
  - Shopping cart with multi-store comparison
  - User dashboard and profile management
  - About page explaining platform functionality
  
- **Admin Interface**:
  - Admin dashboard for system oversight
  - Product management (add, edit, delete products)
  - User management and administration
  
- **Core Functionality**:
  - Product browsing with filters and categories
  - Multi-store price comparison
  - Shopping cart with per-store totaling
  - Delivery fee calculation
  - Stock availability indicators
  - Responsive design for mobile and desktop

#### Backend Application (Node.js + Express)
- **Authentication & Authorization**:
  - User registration and login with JWT tokens
  - Password hashing using bcrypt
  - Protected routes with middleware
  - Role-based access control (Admin/User)
  
- **Database Management**:
  - PostgreSQL database integration using Sequelize ORM
  - User model with secure credential storage
  - Database synchronization and migrations
  
- **API Endpoints**:
  - User authentication endpoints (register, login)
  - Admin management endpoints
  - RESTful API architecture
  - CORS-enabled for frontend integration

#### Product Categories
- Keyboards
- Mice
- Headsets
- Monitors
- Docking stations
- Other computer accessories

### 2.2 Out-of-Scope Features

The following features are **not included** in the current project scope:

- Real-time inventory synchronization with partner stores
- Actual payment processing or checkout completion
- Order fulfillment and shipping integration
- Product reviews and ratings system
- Wishlist functionality
- Price alerts and notifications
- Mobile native applications (iOS/Android)
- Multi-language support
- Advanced analytics and reporting dashboards
- Third-party store API integrations
- Automated price scraping from external websites

---

## 3. Technical Architecture

### 3.1 Frontend Stack
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.12.0
- **HTTP Client**: Axios 1.13.2
- **Styling**: Custom CSS
- **Code Quality**: ESLint with React plugins

### 3.2 Backend Stack
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Database**: PostgreSQL
- **ORM**: Sequelize 6.37.7
- **Authentication**: JSON Web Tokens (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 3.0.3
- **Environment Management**: dotenv 17.2.3
- **CORS**: cors 2.8.5
- **Development**: Nodemon 3.1.11

### 3.3 Database Schema
- **Users Table**: Stores user credentials, roles, and profile information
- Future tables for products, orders, and cart items (planned expansion)

---

## 4. User Roles & Permissions

### 4.1 Guest Users
- View homepage and informational content
- Access about page
- No access to product catalog or cart features

### 4.2 Authenticated Users
- Full access to product catalog
- Add items to shopping cart
- Compare prices across stores
- View delivery fees and availability
- Access personal dashboard and profile
- Manage account settings

### 4.3 Admin Users
- All authenticated user permissions
- Access to admin dashboard
- Manage all users (view, edit, delete)
- Manage products (add, edit, delete)
- System-wide oversight capabilities

---

## 5. Key Functional Requirements

### 5.1 User Authentication
- Secure user registration with email and password
- Login system with JWT token generation
- Session management and protected routes
- Password encryption and secure storage
- Logout functionality

### 5.2 Product Catalog
- Display comprehensive list of computer accessories
- Product details including name, description, and category
- Store-specific pricing information
- Availability status per store
- Product categorization and filtering

### 5.3 Multi-Store Comparison
- Side-by-side price comparison across partner stores
- Delivery fee calculation per store
- Stock availability indicators
- Total cart cost calculation per store
- Store logos and branding

### 5.4 Shopping Cart
- Add/remove products to/from cart
- Quantity adjustment
- Real-time cart total updates
- Per-store subtotal calculations
- Delivery cost inclusion

### 5.5 Admin Management
- User administration interface
- Product CRUD operations
- Dashboard with system overview
- Access control enforcement

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Fast page load times (target < 2 seconds)
- Responsive UI with smooth interactions
- Optimized database queries
- Efficient state management

### 6.2 Security
- Secure password storage with bcrypt hashing
- JWT-based authentication
- Protected API endpoints
- CORS configuration for security
- SQL injection prevention via ORM

### 6.3 Usability
- Intuitive user interface
- Clear navigation structure
- Responsive design for all device sizes
- Accessible color scheme and typography
- Informative error messages

### 6.4 Reliability
- Database connection error handling
- Graceful error recovery
- Input validation on both client and server
- Consistent data synchronization

### 6.5 Maintainability
- Modular code structure
- Separation of concerns (MVC pattern)
- Clear file organization
- Environment-based configuration
- Code comments and documentation

---

## 7. System Boundaries

### 7.1 Internal Components
- React frontend application
- Express.js backend API
- PostgreSQL database
- Authentication middleware
- Product catalog data

### 7.2 External Dependencies
- Node.js runtime environment
- PostgreSQL database server
- NPM package registry
- Browser environment (client-side)

### 7.3 Integration Points
- Frontend-to-Backend API communication via HTTP/REST
- Database connection via Sequelize ORM
- CORS-enabled cross-origin requests

---

## 8. Project Constraints

### 8.1 Technical Constraints
- PostgreSQL database requirement
- Node.js backend limitation
- Browser compatibility for modern browsers only
- No mobile app development

### 8.2 Time Constraints
- Development follows agile methodology
- Features delivered in iterative sprints
- MVP (Minimum Viable Product) focused approach

### 8.3 Resource Constraints
- Single database server
- Development environment setup required
- Local development and testing

### 8.4 Business Constraints
- No real payment processing
- No actual store integrations
- Demonstration/prototype platform
- Static product catalog (no live price feeds)

---

## 9. Deliverables

### 9.1 Application Deliverables
1. Fully functional React frontend application
2. RESTful Express.js backend API
3. PostgreSQL database with schema
4. User authentication system
5. Admin management interface
6. Product catalog and comparison features
7. Shopping cart functionality

### 9.2 Documentation Deliverables
1. Project scope documentation (this document)
2. Database setup instructions
3. README files for frontend and backend
4. API endpoint documentation
5. Installation and deployment guides
6. User guide and feature documentation

### 9.3 Code Deliverables
1. Clean, modular, and maintainable codebase
2. Version-controlled repository
3. Environment configuration templates
4. Package dependency files (package.json)
5. ESLint configuration for code quality

---

## 10. Success Criteria

The project will be considered successful when:

1. **Authentication**: Users can register, login, and access protected routes securely
2. **Product Browsing**: Users can view and filter computer accessories catalog
3. **Cart Management**: Users can add products to cart and view totals
4. **Store Comparison**: Users can compare prices and fees across multiple stores
5. **Admin Functions**: Admins can manage users and products effectively
6. **Database Integration**: All data persists correctly in PostgreSQL
7. **Responsive Design**: Application works on desktop and mobile devices
8. **Error Handling**: System handles errors gracefully with user-friendly messages
9. **Performance**: Pages load within acceptable time frames
10. **Security**: All authentication and authorization mechanisms work correctly

---

## 11. Future Enhancements (Post-MVP)

### Phase 2 Potential Features
- Real-time price updates from partner APIs
- Advanced product search and filtering
- User wishlists and saved carts
- Order history and tracking
- Product reviews and ratings
- Price drop notifications
- Email notifications
- Advanced analytics dashboard

### Phase 3 Potential Features
- Mobile native applications
- Social sharing features
- Loyalty programs and rewards
- Multi-currency support
- International shipping options
- AI-powered product recommendations
- Comparison history tracking
- Export cart to Excel/PDF

---

## 12. Assumptions

1. Users have modern web browsers (Chrome, Firefox, Edge, Safari)
2. PostgreSQL database server is accessible
3. Node.js and npm are installed on development/deployment environments
4. Store data and pricing are maintained manually in the catalog
5. Users have reliable internet connectivity
6. English is the primary language for the platform
7. All product images and assets are properly licensed
8. Users accept terms of service and privacy policy

---

## 13. Dependencies

### 13.1 Development Dependencies
- Node.js (v18 or higher recommended)
- PostgreSQL (v12 or higher)
- npm or yarn package manager
- Git for version control
- Code editor (VS Code recommended)

### 13.2 Runtime Dependencies
See [frontend/package.json](frontend/package.json) and [backend/package.json](backend/package.json) for complete dependency lists.

### 13.3 External Services
- None (currently standalone application)

---

## 14. Risk Assessment

### 14.1 Technical Risks
- **Database Connection Issues**: Mitigation through proper error handling and connection pooling
- **Authentication Vulnerabilities**: Mitigation via JWT best practices and bcrypt hashing
- **State Management Complexity**: Mitigation through React Context API and proper component structure
- **Performance Degradation**: Mitigation via code optimization and lazy loading

### 14.2 Project Risks
- **Scope Creep**: Mitigation through clear requirements and change control process
- **Integration Challenges**: Mitigation via thorough testing and modular architecture
- **Data Consistency**: Mitigation through ORM transactions and validation

---

## Document Control

**Version**: 1.0  
**Date**: January 22, 2026  
**Project Name**: CleanCart  
**Status**: Active Development  

**Prepared by**: Development Team  
**Last Updated**: January 22, 2026
