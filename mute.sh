#!/bin/bash

# Check for required argument
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <channel>"
  exit 1
fi

# AMI credentials and connection details
AMI_USER="admin"
AMI_PASS="12345"
AMI_HOST="localhost"
AMI_PORT="5038"

# AMI command parameters
ACTION="MuteAudio"
CHANNEL=$1  # Use the first script argument as the channel
DIRECTION="out"
STATE=$2

# Send command to AMI using netcat
(
echo "Action: Login"
echo "Username: $AMI_USER"
echo "Secret: $AMI_PASS"
echo "ActionID: 1"
echo ""
echo "Action: $ACTION"
echo "Channel: $CHANNEL"
echo "Direction: $DIRECTION"
echo "State: $STATE"
echo "ActionID: 2"
echo ""
echo "Action: Logoff"
echo "ActionID: 3"
echo ""
) | nc -q 1 $AMI_HOST $AMI_PORT
