# Requirements Document: SmartShelf India

## Introduction

SmartShelf India is an IoT and AI-powered Electronic Shelf Label (ESL) ecosystem designed specifically for Indian retail environments. The system addresses critical pain points in the Indian retail sector: manual pricing inefficiencies, high expiry waste, online-offline price conflicts, and inventory blindness. By replacing traditional paper tags with smart e-ink displays connected to a serverless AWS cloud infrastructure, SmartShelf India enables dynamic pricing, automated expiry management, real-time inventory tracking, and seamless omnichannel synchronization.

The system serves multiple user personas including store owners/managers who need pricing control and analytics, store staff who need restocking alerts and order picking assistance, customers who need accurate pricing information, and delivery partners who need efficient order fulfillment tools.

## Glossary

- **ESL**: Electronic Shelf Label - A smart display device attached to retail shelves showing product information and pricing
- **Device_Shadow**: AWS IoT Core feature that maintains the last known state of an IoT device
- **MQTT**: Message Queuing Telemetry Transport - A lightweight messaging protocol for IoT devices
- **ESP32**: A low-cost microcontroller with Wi-Fi and Bluetooth capabilities used in ESL devices
- **E-Ink_Display**: Electronic paper display technology that mimics printed paper appearance
- **IoT_Core**: AWS service for connecting and managing IoT devices
- **DocumentDB**: AWS managed MongoDB-compatible database service
- **Flash-to-Find**: Feature where ESL LEDs flash to help locate products for order picking
- **Planogram**: Visual diagram showing product placement on retail shelves
- **Dynamic_Pricing_Engine**: System component that calculates and updates prices in real-time
- **Expiry_Management_System**: AI-powered component that triggers automated sales for near-expiry products
- **Competitor_Price_Scraper**: Service that monitors competitor pricing from online sources
- **Shelf_Vision_System**: Computer vision component that detects empty shelves using camera feeds
- **Admin_Dashboard**: Web interface for store management and system configuration
- **Store_Owner**: User persona responsible for pricing strategy and business decisions
- **Store_Staff**: User persona responsible for restocking and order fulfillment
- **Delivery_Partner**: User persona responsible for picking and delivering customer orders
- **NFC_Reader**: Near Field Communication hardware for contactless information access
- **X509_Certificate**: Digital certificate used for secure device authentication
- **IoT_Rules_Engine**: AWS IoT Core component that routes and processes device messages
- **Step_Functions**: AWS service for orchestrating serverless workflows
- **SageMaker**: AWS machine learning service for training and deploying AI models
- **Pinpoint**: AWS service for sending notifications via SMS, email, and push notifications

## Requirements

### Requirement 1: IoT Device Management

**User Story:** As a Store Owner, I want to manage all ESL devices from a central dashboard, so that I can monitor device health and ensure all shelf labels are functioning correctly.

#### Acceptance Criteria

1. WHEN an ESP32 device connects to the system, THE IoT_Core SHALL authenticate it using X509_Certificate
2. WHEN a device connects successfully, THE Device_Shadow SHALL store the device's current state including battery level, display type, and location
3. WHEN a device goes offline, THE IoT_Core SHALL update the Device_Shadow status and notify the Admin_Dashboard within 60 seconds
4. WHEN the Admin_Dashboard requests device status, THE System SHALL return all device information including online/offline status, battery level, last update timestamp, and assigned product
5. WHEN a device battery level falls below 20%, THE System SHALL send an alert to Store_Staff via Pinpoint

### Requirement 2: Dynamic Pricing Updates

**User Story:** As a Store Owner, I want to update prices across all ESL devices instantly, so that I can respond to market changes and competitor pricing without manual label changes.

#### Acceptance Criteria

1. WHEN a Store Owner updates a product price in the Admin_Dashboard, THE Dynamic_Pricing_Engine SHALL publish the new price to all associated ESL devices via MQTT within 5 seconds
2. WHEN an ESL device receives a price update message, THE Device SHALL update the E-Ink_Display to show the new price and send confirmation to IoT_Core
3. WHEN a price update fails to reach a device, THE System SHALL retry the update 3 times with exponential backoff
4. WHEN all retry attempts fail, THE System SHALL log the failure and alert Store_Staff via the Admin_Dashboard
5. WHEN a bulk price update is requested for multiple products, THE System SHALL process all updates in parallel and complete within 30 seconds for up to 1000 devices

### Requirement 3: Automated Expiry Management

**User Story:** As a Store Owner, I want the system to automatically trigger flash sales for products nearing expiry, so that I can reduce waste and recover revenue from perishable inventory.

#### Acceptance Criteria

1. WHEN a product's expiry date is 2 days away, THE Expiry_Management_System SHALL calculate a discounted price based on remaining shelf life and current inventory levels
2. WHEN the discount price is calculated, THE System SHALL automatically update all associated ESL devices with the sale price and display a "Flash Sale" indicator
3. WHEN a product expires, THE System SHALL mark it as expired in DocumentDB and send removal alerts to Store_Staff
4. WHEN Store_Staff confirms product removal, THE System SHALL update inventory records and remove the product from active listings
5. WHERE the Store Owner has configured custom expiry rules, THE Expiry_Management_System SHALL apply those rules instead of default calculations

### Requirement 4: Competitor Price Monitoring

**User Story:** As a Store Owner, I want to monitor competitor prices from online platforms like Blinkit and Zepto, so that I can make informed pricing decisions and remain competitive.

#### Acceptance Criteria

1. WHEN the Competitor_Price_Scraper runs its scheduled job, THE System SHALL fetch current prices for configured products from specified competitor websites
2. WHEN competitor prices are fetched, THE System SHALL store them in DocumentDB with timestamps and source information
3. WHEN a competitor price is significantly lower than the store price (>10% difference), THE System SHALL generate a price alert in the Admin_Dashboard
4. WHEN the Store Owner views competitor price data, THE Admin_Dashboard SHALL display price comparisons with visual indicators for higher, lower, and matching prices
5. IF a competitor website blocks scraping attempts, THEN THE System SHALL log the failure and retry with different request headers

### Requirement 5: Shelf Vision and Stock Alerts

**User Story:** As Store Staff, I want to receive instant alerts when shelves are empty, so that I can restock products before customers notice and maintain customer satisfaction.

#### Acceptance Criteria

1. WHEN the Shelf_Vision_System analyzes camera feed images, THE System SHALL detect empty shelf spaces using computer vision models trained on SageMaker
2. WHEN an empty shelf is detected, THE System SHALL identify the product location using planogram data and send an immediate alert to Store_Staff via Pinpoint
3. WHEN Store_Staff acknowledges a restocking alert, THE System SHALL mark the alert as in-progress and track time to resolution
4. WHEN a shelf is restocked, THE Shelf_Vision_System SHALL detect the change and automatically close the alert
5. WHEN multiple shelves are empty simultaneously, THE System SHALL prioritize alerts based on product demand and sales velocity

### Requirement 6: Flash-to-Find for Order Picking

**User Story:** As a Delivery Partner, I want ESL devices to flash LEDs when I'm picking an order, so that I can quickly locate products and fulfill orders faster.(Store example Jio Mart)

#### Acceptance Criteria

1. WHEN a Delivery Partner scans an order barcode, THE System SHALL identify all products in the order and their ESL device locations
2. WHEN product locations are identified, THE System SHALL send flash commands to the corresponding ESL devices via MQTT
3. WHEN an ESL device receives a flash command, THE Device SHALL activate its LED in a distinctive pattern for 30 seconds
4. WHEN a Delivery Partner confirms picking an item, THE System SHALL stop the LED flash for that specific ESL device
5. WHEN all items in an order are picked, THE System SHALL log the completion time and update order status to ready for delivery

### Requirement 7: NFC Product Information Access

**User Story:** As a Customer, I want to tap my phone on an ESL device to get detailed product information, so that I can make informed purchase decisions without asking store staff.

#### Acceptance Criteria

1. WHEN a Customer taps their NFC-enabled phone on an ESL device, THE Device SHALL transmit a unique product identifier via NFC
2. WHEN the phone receives the product identifier, THE System SHALL redirect the Customer to a mobile-optimized product page hosted on CloudFront
3. WHEN the product page loads, THE System SHALL display comprehensive information including ingredients, nutritional facts, allergen warnings, and customer reviews
4. WHEN the product has special offers or discounts, THE Product page SHALL prominently display the offer details
5. WHERE the product is out of stock, THE Product page SHALL show availability at nearby stores and online ordering options

### Requirement 8: Planogram Compliance Verification

**User Story:** As a Store Owner, I want to verify that products are placed according to brand planograms, so that I can maintain vendor agreements and optimize shelf space revenue.

#### Acceptance Criteria

1. WHEN a Store Owner uploads a planogram document, THE System SHALL parse the document and extract product placement rules including shelf location, facing count, and positioning requirements
2. WHEN ESL devices report their location data, THE System SHALL compare actual product placement against the configured planogram
3. WHEN a product is placed in the wrong location, THE System SHALL generate a compliance violation alert in the Admin_Dashboard
4. WHEN Store_Staff corrects a placement violation, THE System SHALL verify the correction using location data and close the alert
5. WHEN the Store Owner requests a compliance report, THE System SHALL generate a summary showing compliance percentage, violations by category, and historical trends

### Requirement 9: Secure Device Authentication

**User Story:** As a Store Owner, I want all ESL devices to use secure authentication, so that unauthorized devices cannot connect to my system and compromise pricing or inventory data.

#### Acceptance Criteria

1. WHEN an ESP32 device attempts to connect to IoT_Core, THE System SHALL validate the device's X509_Certificate against the certificate authority
2. WHEN certificate validation succeeds, THE IoT_Core SHALL establish an encrypted MQTT connection using TLS 1.2 or higher
3. IF certificate validation fails, THEN THE IoT_Core SHALL reject the connection and log the failed attempt with device identifier and timestamp
4. WHEN a device certificate is revoked, THE System SHALL immediately terminate all active connections from that device
5. WHEN a new device is provisioned, THE System SHALL generate a unique X509_Certificate and securely transfer it to the device during initial setup

### Requirement 10: Offline Resilience

**User Story:** As a Store Owner, I want ESL devices to continue displaying current information during internet outages, so that customers always see accurate pricing even when connectivity is unreliable.

#### Acceptance Criteria

1. WHEN an ESL device loses internet connectivity, THE Device SHALL continue displaying the last received price and product information
2. WHEN connectivity is restored, THE Device SHALL synchronize with Device_Shadow to retrieve any missed updates
3. WHEN multiple updates occurred during offline period, THE Device SHALL apply only the most recent update to avoid unnecessary display refreshes
4. WHEN an ESL device has been offline for more than 24 hours, THE System SHALL flag it for manual inspection in the Admin_Dashboard
5. WHILE a device is offline, THE Device SHALL queue any local events (button presses, sensor readings) and transmit them when connectivity returns

### Requirement 11: Admin Dashboard Access Control

**User Story:** As a Store Owner, I want role-based access control for the Admin Dashboard, so that I can restrict sensitive pricing and analytics features to authorized personnel only.

#### Acceptance Criteria

1. WHEN a user attempts to access the Admin_Dashboard, THE System SHALL authenticate them using Cognito with username and password
2. WHEN authentication succeeds, THE System SHALL retrieve the user's role (Owner, Manager, Staff) and associated permissions
3. WHEN a user with Staff role attempts to access pricing configuration, THE System SHALL deny access and display an authorization error
4. WHEN a user with Owner role accesses analytics, THE System SHALL display comprehensive business metrics including revenue, margins, and waste reduction
5. WHERE multi-factor authentication is enabled, THE System SHALL require a second factor (SMS or authenticator app) before granting access

### Requirement 12: Real-Time Analytics Dashboard

**User Story:** As a Store Owner, I want to view real-time analytics on pricing effectiveness, expiry waste reduction, and inventory turnover, so that I can measure ROI and optimize operations.

#### Acceptance Criteria

1. WHEN the Store Owner accesses the analytics section, THE Admin_Dashboard SHALL display key metrics including total price updates today, active flash sales, and waste reduction percentage
2. WHEN the Store Owner selects a date range, THE System SHALL aggregate historical data from DocumentDB and display trends using interactive charts
3. WHEN a flash sale is active, THE Dashboard SHALL show real-time sales velocity and remaining inventory for discounted products
4. WHEN the Store Owner requests an export, THE System SHALL generate a CSV report with detailed transaction data and download it via CloudFront
5. WHEN system performance metrics are requested, THE Dashboard SHALL display IoT device health statistics, message delivery success rates, and API response times

### Requirement 13: Bulk Device Configuration

**User Story:** As a Store Manager, I want to configure multiple ESL devices simultaneously, so that I can efficiently set up new store sections or update display settings across many devices.

#### Acceptance Criteria

1. WHEN a Store Manager uploads a CSV file with device configurations, THE System SHALL validate the file format and device identifiers
2. WHEN validation succeeds, THE System SHALL create a Step_Functions workflow to process each device configuration in parallel
3. WHEN each device configuration is processed, THE System SHALL update the Device_Shadow with new settings including display refresh rate, LED brightness, and sleep schedule
4. WHEN all configurations are applied, THE System SHALL generate a summary report showing successful updates, failures, and devices that were offline
5. IF any device configuration fails, THEN THE System SHALL log the error details and allow retry for failed devices only

### Requirement 14: Multi-Language Display Support

**User Story:** As a Store Owner operating in diverse Indian regions, I want ESL devices to display product information in multiple languages, so that I can serve customers who prefer regional languages.

#### Acceptance Criteria

1. WHEN a Store Owner configures a product, THE Admin_Dashboard SHALL allow entering product names and descriptions in multiple languages (Hindi, Tamil, Telugu, Bengali, Marathi)
2. WHEN an ESL device is assigned to a specific store location, THE System SHALL configure the device to display text in the primary language for that region
3. WHEN a product has translations available, THE E-Ink_Display SHALL show the product name in the configured language with price in numerals
4. WHERE a translation is missing for a product, THE Device SHALL fall back to English and log a missing translation alert
5. WHEN the Store Owner changes the display language setting, THE System SHALL update all ESL devices in that store section within 60 seconds

### Requirement 15: Energy-Efficient Display Management

**User Story:** As a Store Owner, I want ESL devices to minimize power consumption, so that I can reduce battery replacement costs and maintenance overhead.

#### Acceptance Criteria

1. WHEN an ESL device is idle with no price updates, THE Device SHALL enter deep sleep mode and wake only for scheduled sync intervals
2. WHEN using E-Ink_Display technology, THE Device SHALL update the display only when content changes, consuming power only during the update
3. WHEN a device battery level is reported, THE System SHALL estimate remaining battery life based on usage patterns and display it in the Admin_Dashboard
4. WHEN the Store Owner configures sleep schedules, THE System SHALL allow setting different sync intervals for peak hours (every 5 minutes) and off-peak hours (every 30 minutes)
5. WHEN a device detects low battery, THE Device SHALL reduce LED brightness and increase sleep duration to extend operational life until replacement

## Non-Functional Requirements

### Performance

1. THE System SHALL support up to 10,000 concurrent ESL devices per store without degradation in message delivery latency
2. THE Admin_Dashboard SHALL load within 2 seconds on 3G mobile connections common in Indian retail environments
3. THE Shelf_Vision_System SHALL process camera images and detect empty shelves within 10 seconds of image capture
4. THE Dynamic_Pricing_Engine SHALL handle bulk price updates for 1,000 products in under 30 seconds

### Scalability

1. THE System SHALL scale horizontally using ECS Fargate to handle increased load during peak shopping hours
2. THE DocumentDB cluster SHALL support automatic scaling to accommodate growing product catalogs and transaction history
3. THE IoT_Core SHALL handle message throughput of up to 100,000 messages per minute during simultaneous price updates across multiple stores

### Reliability

1. THE System SHALL maintain 99.9% uptime for critical services including IoT_Core, DocumentDB, and Admin_Dashboard
2. THE System SHALL implement automatic failover for DocumentDB to ensure data availability during infrastructure failures
3. THE System SHALL use S3 for durable storage of device configurations, planograms, and analytics data with 99.999999999% durability

### Security

1. THE System SHALL encrypt all data in transit using TLS 1.2 or higher for MQTT connections and HTTPS for web traffic
2. THE System SHALL encrypt all data at rest in DocumentDB and S3 using AWS KMS managed keys
3. THE System SHALL implement least-privilege IAM policies for all AWS services to minimize security exposure
4. THE System SHALL log all authentication attempts, authorization failures, and sensitive operations to CloudWatch for audit trails

### Maintainability

1. THE System SHALL use Infrastructure as Code (CloudFormation or Terraform) for all AWS resource provisioning to enable reproducible deployments
2. THE System SHALL implement comprehensive logging using CloudWatch Logs for all services to facilitate troubleshooting
3. THE System SHALL use AWS X-Ray for distributed tracing to identify performance bottlenecks across microservices
4. THE System SHALL maintain API documentation using OpenAPI specification for all REST endpoints

### Usability

1. THE Admin_Dashboard SHALL provide a mobile-responsive interface optimized for tablets and smartphones used by Store_Staff
2. THE Admin_Dashboard SHALL support Hindi and English languages for the user interface
3. THE System SHALL provide contextual help and tooltips for complex features like planogram configuration and pricing rules
4. THE System SHALL display clear error messages with actionable guidance when operations fail

### Cost Optimization

1. THE System SHALL use serverless architectures (Lambda, Fargate) to minimize costs during low-traffic periods
2. THE System SHALL implement S3 lifecycle policies to archive old analytics data to Glacier after 90 days
3. THE System SHALL use DocumentDB on-demand scaling to avoid over-provisioning during variable load patterns
4. THE System SHALL monitor AWS costs using Cost Explorer and set up billing alerts for budget thresholds
