from elasticsearch import Elasticsearch

def upgrade(es: Elasticsearch):
    """Creates the sales index if it does not exist."""
    index_name = "sales"
    if not es.indices.exists(index=index_name):
        es.indices.create(index=index_name, body={
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            },
            "mappings": {
                "properties": {
                    "id": { "type": "keyword" },
                    "medicine_id": { "type": "keyword" },
                    "quantity": { "type": "integer" },
                    "total_price": { "type": "float" },
                    "sale_date": { "type": "date" }
                }
            }
        })
        print(f"✅ Index '{index_name}' created successfully.")
    else:
        print(f"⚠️ Index '{index_name}' already exists.")

def downgrade(es: Elasticsearch):
    """Deletes the sales index (if needed for rollback)."""
    index_name = "sales"
    if es.indices.exists(index=index_name):
        es.indices.delete(index=index_name)
        print(f"❌ Index '{index_name}' deleted.")
    else:
        print(f"⚠️ Index '{index_name}' does not exist.")
