# Backend setup

For local development, create `backend/.env` from `.env.example` and set
`JWT_SECRET` to a unique random value. For example, generate one with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then start the API from the `backend` directory with `npm start`. The MongoDB
instance configured in `MONGODB_URI` must be running. Do not use the example
secret in a deployed environment.
