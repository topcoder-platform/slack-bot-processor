# Deployment Guide

## Prerequisites

1. Node.js > v10.14.2

2. ngrok

The instructions to deploy the bot are very similar to TC Central with few minor changes. Some key differences are marked with a tag, **DIFFERENT FROM TC CENTRAL**. Make sure to follow them.
You will also need a new Slack workspace. You cannot reuse the workspace for TC Central.

Follow the below instructions in order to fully deploy the bot locally,

## Dynamodb setup

If you already have dynamodb running, then you can skip the install and run steps 1 and 2

1. Download and install dynamodb from [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)

2. In terminal, navigate to the directory where you extracted DynamoDBLocal.jar, and enter the following command. `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`. This will start dynamodb on port 8000 by default.

3. **ENV** Provide aws dynamodb configuration options in the `provider:environment` field in `serverless.yml`. For local deployment, the values will be,
    ```
    environment:
        # AWS configuration
        AWS_ACCESS_KEY_ID: FAKE_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY: FAKE_SECRET_ACCESS_KEY
        AWS_REGION: FAKE_REGION
        DYNAMODB_ENDPOINT: http://localhost:8000
    ```

3. [Optional] You can view the contents of dynamodb in your browser using a tool like [dynamodb-admin](https://www.npmjs.com/package/dynamodb-admin)

## Create a free Slack account

1. Create a slack account if you don't have one already. Click `Create a new workspace` [here](https://slack.com/get-started).

2. Provide an email address and click confirm

3. A verification code will be sent to your email, post the verification code back to the slack setup page

4. Create a team and a project

5. Click `Skip for now` if you don't want to add more users

![](images/skip.png)

6. You should see your team and your channel created

![](images/created.png)

## Create a Slack App

1. Open the create app page, click [here](https://api.slack.com/apps?new_app=1)

2. Provide a name and select a workspace

![](images/create_app.png)

3. **ENV** Go to app credentials from `Settings` -> `Basic Information`. Get the value of `Signing Secret` and provide it in `provider:environment:CLIENT_SIGNING_SECRET` field in `serverless.yml`

![](images/credentials.png)

4. Click on `Features` -> `Bot users` -> `Add a Bot User`. Provide a name say, `topbot` and click `Add Bot User`

![](images/add_bot_user.png)

5. Click on `Features` -> `OAuth & Permissions` -> `Install App to Workspace`

![](images/install.png)

6. Click `Allow`

![](images/allow.png)

7. **DIFFERENT FROM TC CENTRAL** On the same page, go to `Scopes` -> `Select Permission Scopes` -> Add scope `bot`, `channels:write` and `user:read` and click `Save changes`. Reinstall the app by clicking the link on the top banner.

![](images/scopes.png)

![](images/reinstall.png)

8. **ENV** On success, you will see your `OAuth Access Token` and
 `Bot User OAuth Access Token` in `OAuth Tokens & Redirect URLs`. 
 
 Copy `OAuth Access Token` and provide it in `provider:environment:ADMIN_USER_TOKEN` field in `serverless.yml`.

 Copy `Bot User OAuth Access Token` and provide it in `provider:environment:BOT_TOKEN` field in `serverless.yml`. 

9. **ENV** Slack lambda needs to communicate with TC Central lambda. Set the URI of TC Central lambda in the `provider:environment:CENTRAL_LAMBDA_URI` field in `serverless.yml`. If you haven't already deployed TC Central lambda, you can deploy it at this port later after Slack lambda is deployed. 
    
 By default, TC Central lambda runs on port 3000. So if you are using defaults, you don't need to change this field.

10. All the required environment values in `serverless.yml` should be filled now. It should look something like,
    ```
    provider:
    name: aws
    runtime: nodejs10.x

      environment:
        # AWS configuration
        AWS_ACCESS_KEY_ID: FAKE_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY: FAKE_SECRET_ACCESS_KEY
        AWS_REGION: FAKE_REGION
        DYNAMODB_ENDPOINT: http://localhost:8000

        # Client Slack bot configuration
        ADMIN_USER_TOKEN: xoxp-751151625041-759423359383-845078868144-df39e70e54bf377a1da7d9366d590471
        BOT_TOKEN: xoxb-751151625041-759783514870-rP7Aj9M8EcVsCNb9dSphcrKz
        CLIENT_SIGNING_SECRET: 52810ea6b0cf1e67b2861be8bddce102
        
        # Central TC Lambda URI
        CENTRAL_LAMBDA_URI: 'http://localhost:3000'
    ```

## Start Slack lambda server

1. Install `serverless` globally. `npm i -g serverless`

2. In the `slack-lambda` directory run `npm i` to install required modules

3. [Optional] Check for lint errors by running `npm run lint`. Fix any errors by running `npm run lint:fix`

4. In the `slack-lambda` directory run `serverless offline` to start the Serverless API gateway on port 3001. The gateway runs the lambda functions on demand.

5. Expose the server using `ngrok`. Run `ngrok http 3001`. You will obtain a url like `https://9bb718af.au.ngrok.io`. Note down this value. I will refer to it as `NGROK_URL`.

**NOTE on ngrok** 

If you are using a free version of ngrok, it allows only one simultaneous connection. This is a problem if you want to run both Slack lambda and TC Central and expose both using ngrok. 

The solution is to use the `--region` field while starting ngrok. So, if you're already running ngrok, you will see a region such as `Region United States (us)` in the terminal.
To start another ngrok session just choose another region to run in by executing `ngrok http 3001 --region au`. This will start ngrok in `Region Australia (au)`

## Enable event subscriptions in Slack app

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Features` -> `Event Subscriptions`. Turn it on.

3. Go to `Subscribe to Bot Events` section and add `app_mention` event. (See the image below)

4. Scroll up and provide a `Request URL`. Provide value `NGROK_URL/slack/events` and click `Save changes` once verified.

![](images/events.png)

## Enable interactive components in Slack app

1. Go to https://api.slack.com/apps and click on the app that you created earlier in `Create a Slack App`

2. Click on `Features` -> `Interactive Components`. Turn it on and fill in `NGROK_URL/slack/interactive` into the `Request URL` field. Click Save changes.

![](images/interactive.png)

## Setup slack workspace

1. Invite the bot user `/invite @topbot` to any channel from which you want to launch project requests from

## Setup TC Central lambda

1. If you haven't already done it, then setup TC Central lambda by following its `DeploymentGuide.md` before moving on to [Verification Guide](./VerificationGuide.md). Note that if you change the port of TC Central lambda, then you need to update `provider:environment:CENTRAL_LAMBDA_URI` field in `serverless.yml` **and restart** Slack lambda.