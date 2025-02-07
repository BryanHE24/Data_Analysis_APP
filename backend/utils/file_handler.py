
import os

def save_file(file, upload_folder):
    filepath = os.path.join(upload_folder, file.filename)
    file.save(filepath)
    return filepath
