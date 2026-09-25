# 🛡️ RAKSHA

## From Space to Safety

> **Satellite-Powered Disaster Intelligence & Emergency Response System**

RAKSHA is an end-to-end disaster intelligence and emergency response platform designed to bridge the gap between **disaster detection and field-level action**.

Instead of simply displaying disaster information, RAKSHA transforms satellite and disaster data into actionable decisions — helping responders **detect, prioritize, assess, deploy, navigate, and monitor** disaster situations from a unified operational platform.

---

## 🚨 The Problem

During disasters, critical information is often fragmented across different systems:

* 🛰️ Satellite imagery exists separately from emergency response systems.
* 🚨 Disaster alerts do not always translate into actionable priorities.
* 🚑 Rescue teams need to know where they are needed most.
* 📊 Damage assessment can be difficult and time-consuming.
* 📡 Internet connectivity can become unreliable during emergencies.
* 📜 Historical response actions and operational decisions can be difficult to track.

This creates a major gap between:

> **Knowing that a disaster is happening → Knowing what to do next.**

---

## 💡 Our Solution

RAKSHA connects the complete disaster-response workflow:

```text
Disaster Data
      ↓
Situational Awareness
      ↓
Priority Analysis
      ↓
Damage Assessment
      ↓
Rescue Deployment
      ↓
Disaster-Aware Navigation
      ↓
Analytics & Audit
```

### Core Philosophy

**Detect → Prioritize → Assess → Deploy → Navigate → Learn**

---

## ⭐ What Makes RAKSHA Different?

RAKSHA does not claim to invent satellite imagery, mapping, or AI individually.

Its differentiation lies in integrating these technologies into a single operational workflow.

### 1. 🛰️ Satellite Data → Action

Instead of simply showing:

> "A disaster has occurred here."

RAKSHA helps answer:

* Where is the disaster?
* How severe is it?
* Who is affected?
* What should be handled first?
* Which rescue team should be deployed?
* How can responders reach the affected region?

### 2. 🧠 Intelligent Priority Queue

RAKSHA converts multiple disaster factors into an actionable priority score.

The system considers:

* Disaster severity
* Population impact
* Infrastructure impact
* Urgency

This helps responders determine which location should receive attention first.

### 3. 🚑 Intelligence → Rescue Deployment

```text
High-Risk Sector Detected
          ↓
Priority Score Generated
          ↓
Team Assigned
          ↓
Database Updated
          ↓
Audit Event Created
          ↓
Notification Generated
          ↓
Analytics Updated
```

Rescue team assignments and de-assignments are persisted and auditable.

### 4. 🗺️ Disaster-Aware Offline Navigation

RAKSHA considers disaster context rather than simply finding the shortest route.

It can use:

* Last known location
* Cached geographic information
* Cached road data
* Known hazard/disaster zones

This allows the system to generate a lower-risk route based on the latest available information, even when connectivity is unavailable.

> RAKSHA does not claim absolute safety. It provides the safest available route based on the information accessible to the system.

### 5. 🔄 Centralized Operational Event System

Important operational changes can propagate across:

* 🔔 Notifications
* 🚨 Live Alerts
* 📊 Analytics
* 📜 Audit Event History

Example:

```text
Team Assigned
     ↓
Database Updated
     ↓
Notification Generated
     ↓
Audit History Updated
     ↓
Analytics Updated
```

This makes RAKSHA an integrated operational platform rather than a collection of disconnected dashboards.

---

# 🖥️ Platform Modules

## 📊 1. Dashboard

The central disaster command center providing rapid situational awareness.

Includes:

* Critical / High / Medium / Safe incidents
* Affected population
* Live disaster map
* Satellite intelligence
* Priority queue
* Damage assessment
* Rescue teams
* System status
* Operational alerts

## 🗺️ 2. Live Disaster Map

Interactive geospatial visualization powered by **Leaflet**.

Displays:

* Disaster locations
* Risk levels
* Geographic coordinates
* Disaster zones
* Operational map information

### Risk Levels

🔴 **Critical**
🟠 **High**
🟡 **Medium**
🟢 **Safe**

The map is geographically focused on the Indian operational region.

## 🛰️ 3. Live Satellite Feed

RAKSHA integrates satellite observation sources including:

### Sentinel-1

* SAR imagery
* Disaster monitoring
* Can operate through cloud cover and at night

### Sentinel-2

* Optical multispectral Earth observation

### Landsat 9

* Optical Earth observation
* Environmental monitoring

Fallback imagery is used where necessary so the prototype can remain functional when external imagery services are unavailable.

## 🧠 4. Priority Queue

Ranks affected sectors according to operational importance.

The scoring model considers:

```text
Severity
Population Impact
Infrastructure Impact
Urgency
        ↓
Priority Score
        ↓
Ranked Response Queue
```

This transforms raw disaster information into a response-oriented decision layer.

## 🛰️ 5. Damage Assessment

Provides pre-event and post-event comparison.

Estimated damage can be represented through categories such as:

* Destroyed
* Severe
* Moderate
* Minor
* Safe

Damage information is visualized spatially to help responders understand the geographical distribution of impact.

The architecture can be extended with dedicated remote-sensing and computer-vision models for advanced automated assessment.

## 🚑 6. Rescue Teams

Provides operational rescue-team management.

Capabilities include:

* View available teams
* Assign teams to affected sectors
* De-assign teams
* Track assignment state
* Persist operational changes
* Record assignment history
* Generate corresponding events

## 🗺️ 7. Offline Maps

Designed for disaster scenarios where network connectivity may become unavailable.

The system can use:

* Last known location
* Cached map information
* Cached road network
* Known disaster zones

```text
Last Known Location
        +
Cached Roads
        +
Known Hazards
        ↓
Offline Route Calculation
        ↓
Lower-Risk Route
```

RAKSHA is designed around **graceful degradation** rather than complete failure when connectivity is lost.

## 📈 8. Analytics

Provides operational and historical insights including:

* Disaster trends
* Response information
* Population impact
* Priority distribution
* Operational activity
* Historical events
* Audit history

### Audit Event History

Tracks meaningful operational events such as:

* Rescue team assignment
* Rescue team de-assignment
* Disaster updates
* Damage assessment updates
* Satellite updates
* Priority changes
* Offline route generation
* System events

## 🔔 9. Notifications & Live Alerts

Communicates important operational events.

Examples include:

* High-priority disaster detected
* Rescue team assigned
* Rescue team de-assigned
* Damage assessment updated
* Satellite information updated
* Priority changed
* Offline route generated

Events can be synchronized across the platform using the backend event system.

## ⚙️ 10. Settings

Provides configurable system behavior and operational preferences.

The settings layer is connected to backend configuration rather than being purely visual frontend controls.

## ℹ️ 11. About

Provides project context including:

* Motivation
* Research
* Technologies
* Data sources
* Development approach
* Team
* Future scope

---

# 🏗️ Technical Architecture

```text
                         RAKSHA
                            │
             ┌──────────────┴──────────────┐
             │                             │
      EXTERNAL DATA                    USER INPUT
             │                             │
      ┌──────┼────────┐                    │
      ↓      ↓        ↓                    │
    USGS   NASA     Sentinel               │
           FIRMS                            │
      │      │        │                    │
      └──────┼────────┘                    │
             ↓                             │
        RAKSHA BACKEND ←───────────────────┘
             │
       Node.js + Express
             │
      ┌──────┼──────────────┐
      ↓      ↓              ↓
  Disaster  Priority      Rescue
  Service   Engine        Service
      │      │              │
      └──────┼──────────────┘
             ↓
      PostgreSQL + PostGIS
             │
        ┌────┴────┐
        ↓         ↓
      REST API   SSE
        │         │
        └────┬────┘
             ↓
      React + TypeScript
             │
       ┌─────┼───────────┐
       ↓     ↓           ↓
     Maps  Analytics  Operations
             │
             ↓
          IndexedDB
             │
             ↓
      Offline Navigation
```

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Leaflet
* Recharts
* Lucide Icons

## Backend

* Node.js
* Express
* TypeScript
* REST APIs
* Server-Sent Events (SSE)

## Database

* PostgreSQL
* PostGIS

PostGIS is used for spatial operations involving:

* Coordinates
* Disaster zones
* Geographic relationships
* Roads
* Routes
* Spatial queries

## Offline Storage

* IndexedDB
* Cached geographic data
* Cached road data
* Last known location

---

# 🌍 Data Sources & APIs

RAKSHA integrates multiple external data sources:

| Source                    | Purpose                         |
| ------------------------- | ------------------------------- |
| **USGS**                  | Earthquake information          |
| **NASA FIRMS**            | Fire and hotspot information    |
| **Copernicus / Sentinel** | Satellite Earth observation     |
| **OpenStreetMap**         | Geographic and road information |

---

# 🔄 Real-Time Event Architecture

RAKSHA uses a centralized operational event model.

```text
USER / SYSTEM ACTION
        ↓
Backend Service
        ↓
Database
        ↓
Audit Event
        ↓
SSE
        ↓
┌──────────────┼──────────────┐
↓              ↓              ↓
Notifications  Live Alerts   Analytics
```

### Example

```text
Assign Team
    ↓
API Request
    ↓
Database Transaction
    ↓
Assignment Persisted
    ↓
Audit Event
    ↓
Notification
    ↓
Analytics History
```

This ensures operational actions remain traceable.

---

# 🗄️ Data Persistence

RAKSHA does not rely solely on frontend state for critical operations.

Important information is persisted through the backend/database, including:

* Disaster information
* Rescue teams
* Team assignments
* De-assignments
* Audit events
* Notifications
* Analytics information
* Operational configuration

This allows information to remain available across page refreshes and sessions.

---

# 🔌 API & Resilience Strategy

RAKSHA is designed to remain functional even when external services are unreliable.

```text
Primary External Source
        ↓
     Unavailable
        ↓
Fallback Source
        ↓
     Unavailable
        ↓
Local / Bundled Data
```

This approach is particularly important for disaster-response environments where external connectivity cannot always be guaranteed.

---

# 🔐 Production Considerations

The current implementation is a **functional prototype / proof of concept**.

For large-scale production deployment, RAKSHA would require:

* Authentication and role-based authorization
* API security
* Encryption
* Advanced monitoring
* High-availability infrastructure
* Automated backups
* Scalable event processing
* Disaster-data validation
* More advanced satellite-image analysis
* Extensive field testing
* Integration with official emergency-response systems

---

# 🚀 Future Scope

RAKSHA can be extended with:

* 🤖 AI-based satellite damage segmentation
* 🌊 Flood and wildfire prediction
* 🌪️ Multi-hazard forecasting
* 🚁 Drone integration
* 📡 IoT sensor integration
* 🏛️ Government emergency-response APIs
* 📱 Dedicated responder mobile application
* 🧭 Advanced evacuation optimization
* 🌐 Multi-language support
* 🎙️ Voice-based emergency assistance
* 📦 Predictive resource allocation
* 🛰️ Real-time satellite tasking
* 🎮 Advanced disaster simulation

---

# 👥 Team

### Muskan — Team Leader

* Team coordination
* Project management
* Overall direction
* Integration of team contributions

### Manu Kumar — Tech Lead & Technical Developer

* System architecture
* Frontend development
* Backend development
* Database integration
* API integration
* Maps and geospatial functionality
* Real-time event architecture
* Offline navigation
* Technical integration

### Mayank Thakur — Idea & Development

* Core problem ideation
* Product concept development
* Feature development
* Solution refinement

### Mansi Shukla — Research & Development

* Domain research
* Disaster-management research
* Feasibility analysis
* Research-driven solution development

### Nandani Gupta — Presentation & Key Ideas Analyst

* Presentation strategy
* Key idea analysis
* Communication of project impact
* Concept refinement

### Mayuri Jindal — Research & Solutions

* Research
* Solution development
* Basic frontend ideation
* Topic-to-solution integration

---

# 🎯 Core Value Proposition

RAKSHA transforms fragmented disaster information into coordinated action.

```text
Satellite Intelligence
        ↓
Risk Prioritization
        ↓
Damage Assessment
        ↓
Rescue Deployment
        ↓
Offline Disaster-Aware Navigation
        ↓
Analytics & Accountability
```

---

# 📌 Project Status

**Status: Functional Prototype / Proof of Concept**

### Implemented

* ✅ Disaster command dashboard
* ✅ Interactive disaster map
* ✅ Satellite feed
* ✅ Three-satellite architecture
* ✅ Priority queue
* ✅ Damage assessment
* ✅ Rescue team assignment
* ✅ Rescue team de-assignment
* ✅ Persistent operational data
* ✅ Notifications
* ✅ Live alerts
* ✅ Audit event history
* ✅ Analytics
* ✅ Offline map/navigation workflow
* ✅ Settings
* ✅ About section
* ✅ Real-time event synchronization

---

# 🌍 Vision

RAKSHA aims to move disaster response from:

> **Reactive information sharing**

towards:

> **Proactive, data-driven and coordinated decision making.**

---

## 🛡️ From Space to Safety.
