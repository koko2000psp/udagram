import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { checkJWT } from './checkAuth';
import {sign} from 'jsonwebtoken';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  let masterPassword = process.env.MASTER_PASSWORD
  let jwtSecret = process.env.JWT_SECRET
  
  // Use the body parser middleware for post requests
  // Use Auth middleware for authuntication
  app.use(bodyParser.json());
  app.use('/filteredimage', checkJWT)

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  //! END @TODO1

  app.get('/filteredimage', async (req: Request, res: Response) =>{
    let { image_url } : {image_url: string} = req.query
    if(!image_url)
      res.status(400).send('No image URL was found')

    console.log('Image url is: '+ image_url)

    try{
      let path: string = await filterImageFromURL(image_url)
      // After we send the file we then call delete 
      res.status(200).sendFile(path, () => {
        deleteLocalFiles([path])
      })
    }catch(err){
      // we dont need to delete the file if some error because 
      // the last thing we do in filterImageFromURL after 
      // all processing.
      res.status(500).send(err.message)
    }         
  })
  

  // get JWT token endpoint
  app.post('/auth', async (req: Request, res: Response)=>{
    let { pass } : {pass: string} = req.body


    if(!pass){
        res.status(400).send('BAD REQUEST. Please provide a password.')
        return;
    }
  
    if (pass != masterPassword){
        res.status(401).send('Incoreect master password')
        return;
    }

    // else return the token 
    res.status(200).send(sign({}, jwtSecret, { expiresIn: '5h' }))
    
  })


  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();