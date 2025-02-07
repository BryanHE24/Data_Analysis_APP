import pandas as pd
import base64
import io
import matplotlib.pyplot as plt

def generate_visualizations(df):
    plots = {}
    plt.close('all')
    numerical_cols = df.select_dtypes(include=['number']).columns

    for col in numerical_cols:
        plt.figure(figsize=(8, 6))
        df[col].hist()
        plt.title(f'Histogram of {col}')
        plots[f'histogram_{col}'] = save_plot()
    
    plt.figure(figsize=(10, 6))
    df[numerical_cols].boxplot()
    plt.title('Box Plot of Numerical Columns')
    plots['boxplot'] = save_plot()
    
    if len(numerical_cols) > 1:
        plt.figure(figsize=(8, 6))
        plt.scatter(df[numerical_cols[0]], df[numerical_cols[1]])
        plt.title(f'Scatter Plot: {numerical_cols[0]} vs {numerical_cols[1]}')
        plt.xlabel(numerical_cols[0])
        plt.ylabel(numerical_cols[1])
        plots['scatter'] = save_plot()

    return plots


def save_plot():
    img = io.BytesIO()
    plt.tight_layout()
    plt.savefig(img, format='png')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode('utf8')
    plt.close()
    return plot_url


def analyze_dataset(df, filename):
    description = df.describe().to_dict()
    columns = df.columns.tolist()
    dtypes = [str(t) for t in df.dtypes.tolist()]
    shape = df.shape
    null_counts = df.isnull().sum().to_dict()
    plots = generate_visualizations(df)

    return {
        'message': 'File uploaded and analyzed successfully',
        'filename': filename,
        'description': description,
        'columns': columns,
        'dtypes': dtypes,
        'shape': shape,
        'null_counts': null_counts,
        'plots': plots
    }