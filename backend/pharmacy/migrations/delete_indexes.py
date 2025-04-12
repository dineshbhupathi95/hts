from elasticsearch import Elasticsearch

# Connect to Elasticsearch
es = Elasticsearch("http://localhost:9200")


# List of index names to delete
indexes_to_delete = ["medicines", "sales"]

# Delete indexes
for index_name in indexes_to_delete:
    if es.indices.exists(index=index_name):
        print(f"index{index_name} exists")
        # es.indices.delete(index=index_name)
        # print(f"✅ Index '{index_name}' deleted.")
    # else:
    #     print(f"⚠️ Index '{index_name}' does not exist.")
