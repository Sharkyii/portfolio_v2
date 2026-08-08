# RCA/CAPA Analysis Pipeline

**Automated Manufacturing Insights & Defect Reduction System**

This enhanced pipeline analyzes automotive complaint data to identify failure patterns, cluster recurring defects, and generate actionable manufacturing insights to improve product quality.

## Key Features

- **LLM-Powered Insights**: Uses Qwen/Qwen2.5-3B-Instruct for executive summaries and root cause hypothesis (requires API key).
- **Pattern Clustering**: Uses TF-IDF + K-Means to group similar complaints automatically.
- **Visual Analytics**: Generates 8 professional charts for data-driven manufacturing decisions.
- **Professional Reporting**: Outputs a publication-ready PDF report with embedded analytics.

![Analysis Dashboard](output/severity_distribution.png)

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Add your HuggingFace API Key for AI features:
     ```env
     HUGGINGFACE_API_KEY=hf_your_key_here
     ```

3. **Run Analysis**:
   - For a quick test with sample data:
     ```bash
     python analysis.py --test
     ```
   - To run with real data (configure URL in `.env`):
     ```bash
     python analysis.py
     ```

## Generated Artifacts

The pipeline creates a comprehensive PDF report and a suite of visualization charts in the `output/` directory:

| Report | Charts |
|--------|--------|
| **[RCA_Analysis_Report.pdf](output/RCA_Analysis_Report.pdf)** | Full 7-page analysis with executive summary, CAPA recommendations, and manufacturing insights. |

### Visualization Gallery

| Severity Analysis | Component Failures |
|-------------------|-------------------|
| ![Severity](output/severity_distribution.png) | ![Components](output/component_failures.png) |

| Trend Analysis | Heatmap Analysis |
|----------------|------------------|
| ![Trend](output/monthly_trend.png) | ![Heatmap](output/severity_heatmap.png) |

| Complaint Clustering | Geographic Spread |
|---------------------|-------------------|
| ![Clusters](output/cluster_analysis.png) | ![Map](output/geographic_distribution.png) |

## Project Structure

- `analysis.py`: Main pipeline script
- `config.py`: Centralized configuration
- `llm_utils.py`: AI integration module (Qwen)
- `clustering.py`: Machine learning clustering implementation
- `visualizations.py`: Chart generation engine
- `sample_test_data.csv`: Expanded test dataset (30 records)

## License
Internal Use Only - EY Automotive Safety Analysis
