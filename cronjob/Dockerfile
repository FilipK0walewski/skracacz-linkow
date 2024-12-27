# Use an Alpine-based image
FROM alpine:latest
    
# Install PostgreSQL client and cron
RUN apk add --no-cache bash curl cron postgresql-client

# Add your cron job script
COPY ./my_cron_job.sh /usr/local/bin/my_cron_job.sh
RUN chmod +x /usr/local/bin/my_cron_job.sh

# Add the cron job to the crontab file
RUN echo "* * * * * root /usr/local/bin/my_cron_job.sh >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Create log file
RUN touch /var/log/cron.log

# Start the cron service in the foreground
CMD crond -f
