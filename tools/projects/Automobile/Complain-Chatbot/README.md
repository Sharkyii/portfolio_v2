# Vehicle Safety Complaint Chatbot

An AI-powered chatbot application for collecting vehicle safety complaints and feedback. Built with Streamlit and integrated with Hugging Face LLM APIs.

## Features

- **Intelligent Data Collection**: Uses LLM to extract and validate vehicle safety information from natural conversation
- **RAG (Retrieval Augmented Generation)**: Context-aware responses with domain knowledge about vehicles, VINs, and safety components
- **Smart Field Management**: Prevents duplicate questions and tracks collected information
- **Data Validation**: Real-time validation of VINs, state codes, dates, and other fields
- **Google Sheets Integration**: Automatic storage of complaints and feedback

## Project Structure

```
├── app.py                 # Main Streamlit application entry point
├── complaint_bot.py       # Safety complaint collection chatbot
├── feedback_bot.py        # General feedback collection chatbot
├── shared_utils.py        # Shared utilities, LLM functions, and field management
├── knowledge_base.py      # RAG knowledge base for vehicle/safety context
├── requirements.txt       # Python dependencies
├── .streamlit/
│   └── secrets.toml       # API keys and credentials (not in repo)
└── README.md
```

## Prerequisites

- Python 3.8 or higher
- Hugging Face API key
- Google Cloud service account (for Sheets integration)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sharkyii/final-complaint-chatbot.git
   cd final-complaint-chatbot
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure secrets:
   Create `.streamlit/secrets.toml` with:
   ```toml
   [huggingface]
   api_key = "your-huggingface-api-key"

   [gcp_service_account]
   type = "service_account"
   project_id = "your-project-id"
   private_key_id = "your-key-id"
   private_key = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   client_email = "your-service-account@project.iam.gserviceaccount.com"
   client_id = "your-client-id"
   auth_uri = "https://accounts.google.com/o/oauth2/auth"
   token_uri = "https://oauth2.googleapis.com/token"
   ```

## Usage

Run the application:
```bash
streamlit run app.py
```

The application will be available at `http://localhost:8501`

## Configuration

### Environment Variables

All sensitive configuration is managed through Streamlit secrets (`.streamlit/secrets.toml`):

| Secret | Description |
|--------|-------------|
| `huggingface.api_key` | Hugging Face API key for LLM access |
| `gcp_service_account` | Google Cloud service account credentials |

### Google Sheets Setup

1. Create a Google Sheet named "Safety_Reports"
2. Share the sheet with your service account email
3. The application will automatically append rows with collected data

## API Reference

### LLM Model
- **Chat Model**: `meta-llama/Llama-3.1-8B-Instruct` (via Hugging Face Router)

### Data Fields

**Complaint Fields:**
- Vehicle: Make, Model, Model_Year, VIN, Mileage
- Location: City, State
- Incident: Speed, Crash, Fire, Injured, Deaths, Component
- Details: Description, Date_Complaint

**Automated Fields:**
- Timestamp, Input_Length, Suspicion_Score, User_Risk_Level

## Development

### Code Style
- Follow PEP 8 guidelines
- Use type hints where applicable
- Document functions with docstrings

### Testing
```bash
python -m py_compile app.py complaint_bot.py shared_utils.py knowledge_base.py
```

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, please open an issue in the repository.
