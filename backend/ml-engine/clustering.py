import sys
import json
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.cluster import AgglomerativeClustering

def cluster_grievances(grievances_json, distance_threshold=0.4):
    data = json.loads(grievances_json)
    df = pd.DataFrame(data)
    
    if df.empty:
        return json.dumps([])

    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(df['text'].tolist(), show_progress_bar=False)
    
    clustering = AgglomerativeClustering(
        n_clusters=None, metric='cosine', linkage='average', distance_threshold=distance_threshold
    )
    df['cluster_id'] = clustering.fit_predict(embeddings).astype(int)
    
    summary = df.groupby('cluster_id').agg({
        'id': list, 'text': 'first', 'category': 'first', 'location': 'first', 'urgency': 'max'
    }).reset_index()
    summary['complaint_count'] = df.groupby('cluster_id').size().values
    
    return summary.to_json(orient='records')

if __name__ == '__main__':
    print(cluster_grievances(sys.stdin.read()))
