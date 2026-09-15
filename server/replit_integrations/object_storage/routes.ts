import type { Express, Request, Response } from "express";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

/**
 * Register object storage routes for file uploads.
 */
export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();

  app.post("/api/uploads/request-url", async (req: Request, res: Response) => {
    try {
      const { name, size, contentType } = req.body;
      if (!name) return res.status(400).json({ error: "Missing required field: name" });
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Using a middleware-style approach for the wildcard route to avoid path-to-regexp issues
  app.use("/objects", (req: Request, res: Response, next) => {
    if (req.method !== 'GET') return next();
    
    const objectPath = req.path.startsWith('/') ? req.path.substring(1) : req.path;
    if (!objectPath) return next();

    const fullPath = `/objects/${objectPath}`;
    
    objectStorageService.getObjectEntityFile(fullPath)
      .then(objectFile => objectStorageService.downloadObject(objectFile, res))
      .catch(error => {
        console.error("Error serving object:", error);
        if (error instanceof ObjectNotFoundError) {
          res.status(404).json({ error: "Object not found" });
        } else {
          res.status(500).json({ error: "Failed to serve object" });
        }
      });
  });
}
