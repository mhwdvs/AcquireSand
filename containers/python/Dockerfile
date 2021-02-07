FROM python:3.6-buster

COPY . /usr/local/gpucompare

# schedule script to run every day
RUN pip install -r /usr/local/gpucompare/requirements.txt

#CMD python /usr/local/gpucompare/GPUCompare.py
CMD /usr/local/gpucompare/wait-for-it.sh chromedriver:4444 --\
 python /usr/local/gpucompare/GPUCompare.py