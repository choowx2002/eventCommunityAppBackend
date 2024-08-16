### Usage for web socket api

1. setup the environment .env file in web_socket_api\.env

   ```
   PORT=5000
   IPV4='192.168.176.13' // this will be your ipv4 address or hostname
   ```

2. install

   ```
    cd .\web_socket_api\
   npm install
   ```

3. run server

   ```
   npm start
   ```

4. check server or status in dashboard
   1. visit https://admin.socket.io
   2. enter server URL such as http://localhost:5000
   3. then you can view all the status.

### Usage for web based api

1.  setup the environment .env file in web_socket_api\.env

    ```
    PORT=3000
    Ethernet='192.168.176.114'// this will be your ipv4 address or hostname
    HOST= 'localhost'
    USER= 'root'
    PASSWORD= 'cwxcwx123123'
    DBNAME= 'event_community_app'/create in your local db
    ```

2.  install

    ```
    cd .\web_based_api\
    npm install
    ```

3.  setup the database with run node init_db.js
    ```
    cd .\database\ 
    node init_db.js
    ```

    3.1 if error then go to database\conn.js and replace the variable with your env
    ```
    const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cwxcwx123123',
    database: 'event_community_app',
    });
    ```

4. run server
    ```
    cd ../ //cd out if you in database dir
    npm start
    ```

### API Format
https://github.com/omniti-labs/jsend