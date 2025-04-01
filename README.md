### 📁 `powerline-fault-logger`

#### 📝 Description
A Node.js-based web app for logging and exporting power line fault data to CSV files. Features a static frontend, RESTful API, and real-time session handling with server-side CSV storage.

#### 📦 Features
- Log faults with structured metadata (e.g. GPS, labels, images)
- Dynamic file creation based on date and "flight sessions"
- JSON POST endpoint for fault submission
- CSV output with header consistency

#### 🚀 Tech Stack
- Node.js + Express
- HTML/CSS/JS frontend

#### 📂 Folder Structure
```
logs/            # CSV output
public/          # Static frontend files
vm_logger.js     # Express server
```

#### 📜 License
MIT
