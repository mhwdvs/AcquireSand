FROM python:3.6-buster

COPY . /usr/local/gpucompare

# schedule script to run every day
RUN pip install -r /usr/local/gpucompare/requirements.txt

CMD /usr/local/gpucompare/wait-for-it.sh chromedriver:4444 && python -u /usr/local/gpucompare/GPUCompare.py
