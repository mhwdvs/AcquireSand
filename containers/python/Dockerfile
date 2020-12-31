FROM python:3.6-buster

COPY . .

# schedule script to run every day
RUN pip install -r requirements.txt

CMD [ "python", "GPUCompare.py" ]