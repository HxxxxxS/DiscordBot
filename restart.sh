#!/bin/bash

if [ "$(which forever 2>/dev/null)" == '' ]; then
    echo "This script requires https://github.com/foreversd/forever, please install and try again."
    exit 1
fi

echo "CRON: Cronjob started."

forever stop discordbot

echo "CRON: Killed old forever process... Starting a new one."

sleep 1

forever --uid discordbot start -a index.js

echo "CRON: Bot is running. We are finished"
echo ""
echo "Bot output: (ctrl+c will not kill the bot process)"

tail -fn 0 ~/.forever/discordbot.log
