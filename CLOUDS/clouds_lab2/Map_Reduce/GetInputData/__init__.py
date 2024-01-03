from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient

def GetInputDataFn():
    try:
        connect_str='DefaultEndpointsProtocol=https;AccountName=mapreducestoragefile;AccountKey=DO0jhcQ3RwiJ2m4DepcS4AWC7CiTOFPWZ9gOzoUrSah9rVEo6PyYEw5d0p6MFGPYqFLGxQy93s/C+ASt8d49OQ==;EndpointSuffix=core.windows.net'
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)
        content=""
        for i in range(1,5):
            blob_client = blob_service_client.get_blob_client(container="inputfiles", blob="mrinput-"+str(i)+".txt")
            # Download the blob content as bytes
            blob_data = blob_client.download_blob()
            content+=blob_data.readall().decode("utf-8")
        inputfiles=[]
        for count,i in enumerate(content.split("\r\n")):
            inputfiles.append((count,i))
        return inputfiles
    except Exception as ex:
        print('Exception:')
        print(ex)