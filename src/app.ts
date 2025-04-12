import express, {Response , Request} from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import routes from './routes/index';
import cors from "cors"
import './db';

const app = express();
app.use(cors())


app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
// app.use((req: any, res: { header: (arg0: string, arg1: string) => void; }, next: () => void) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Origen de tu cliente
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); 
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//   next();
// });


app.use('/', routes);

// Error catching endware.
app.use((err: any, _req: Request, res: Response) => {
  const status = err.status || 500;
  const message = err.message || err;
  console.error(err);
  res.status(status).send(message);
});

// module.exports = app;
 export default app;