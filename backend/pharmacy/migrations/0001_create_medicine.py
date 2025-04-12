from elasticsearch import Elasticsearch

def upgrade(es: Elasticsearch):
    """Creates the medicines index if it does not exist."""
    index_name = "medicines"
    if not es.indices.exists(index=index_name):
        es.indices.create(index=index_name, body={
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            },
            "mappings": {
                "properties": {
                    "id": { "type": "keyword" },
                    "name": { "type": "text" },
                    "price": { "type": "float" },
                    "quantity": { "type": "integer" },
                    "manufacturer": { "type": "text" },
                    "created_at": { "type": "date" }
                }
            }
        })
        print(f"✅ Index '{index_name}' created successfully.")

def downgrade(es: Elasticsearch):
    """Deletes the medicines index (if needed for rollback)."""
    index_name = "medicines"
    if es.indices.exists(index=index_name):
        es.indices.delete(index=index_name)
        print(f"❌ Index '{index_name}' deleted.")
