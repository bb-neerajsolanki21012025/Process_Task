/*
 * This Java source file was generated by the Gradle 'init' task.
 */
package backend;

import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.*;

import java.util.UUID;

import io.vertx.core.*;
import io.vertx.ext.jdbc.JDBCClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.CorsHandler;

public class App extends AbstractVerticle{

    private JDBCClient client;
    
    @Override
    public void start(){

        // ========  connection with database ======== //
        JsonObject config = new JsonObject()
        .put("url", "jdbc:mysql://localhost:3306/taskdb")  // Database URL
        .put("driver_class", "com.mysql.cj.jdbc.Driver")          // MySQL driver
        .put("user", "neeraj")                                      // Database username
        .put("password", "123")                                    // Database password
        .put("max_pool_size", 30);                                 // Max pool size (optional)

        // Create JDBC client
        client = JDBCClient.createShared(vertx, config);



        Router router = Router.router(vertx);

        router.route().handler(CorsHandler.create("*")  // Allow requests from any origin
        .allowedMethod(HttpMethod.GET)             // Allow specific HTTP methods
        .allowedMethod(HttpMethod.POST)
        .allowedMethod(HttpMethod.PUT)
        .allowedMethod(HttpMethod.DELETE)
        .allowedHeader("Access-Control-Allow-Headers")
        .allowedHeader("Content-Type")
        .allowedHeader("Authorization"));

        router.get("/master").handler(this:: getMasters); // to get master task templates'
        router.get("/master/task/*").handler(this:: getChildTasks);// to get tasks by parent id
        router.get("/master/*").handler(this:: getMaster); // to get a particular master by master id
        router.post("/master").handler(this:: postMaster); // to create master task template

        router.post("/task").handler(this:: postTask);  //to create task
        router.get("/task/*").handler(this:: getTask); // to get task by task id(task's id)
        router.put("/task/*").handler(this:: updateTask); // to update task by task id(task's id) (useful in editing)
        router.delete("/task/*").handler(this::deleteTask); // to delete the task 



        // Create an HTTP server
        vertx.createHttpServer()
            .requestHandler(router)
            .listen(8080,res->{
                if(res.succeeded()){
                    System.out.println("server started at http://localhost:8080");
                }else{
                    System.out.println(res);
                }
            });

    }



    private void deleteTask(RoutingContext context){
        HttpMethod method = context.request().method();
        System.out.println("HTTP method is "+ method);

        String path = context.request().path();
        String extractedPath = path.replaceFirst("^/task/", "");

        String query = "delete from tasks where id = " + extractedPath +";";

        client.query(query,res->{
            if(res.succeeded()){
                context.response()
                .setStatusCode(200)
                .setStatusMessage("ok")
                .end("task has been deleted");
            }else{
                context.response()
                .setStatusCode(500)
                .end("database error");
            }
        });
    }
    
    private void getMaster(RoutingContext context){
        HttpMethod method = context.request().method();
        System.out.println("HTTP method is "+ method);

        String path = context.request().path();
        String extractedPath = path.replaceFirst("^/master/", ""); 
        
        String query = "select * from masterTasks where id = " + extractedPath + ";";

        client.query(query,res->{
            if(res.succeeded()){
                System.out.println("after succeed");
                // System.out.println();

                JsonArray jsonArray = new JsonArray(res.result().getRows().toString());
                // System.out.println(jsonArray);
               
                for(int i=0;i<jsonArray.size();i++){
                    //======== output =======//
                    // JsonObject jsonObject = jsonArray.getJsonObject(i);
                    String outputFormatString = jsonArray.getJsonObject(i).getString("output_format");
                    JsonObject outputFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("output_format",outputFormat);

                    //======== input =======//
                    outputFormatString = jsonArray.getJsonObject(i).getString("input_format");
                    JsonObject inputFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("input_format",inputFormat);


                    //======== eta =======//
                    outputFormatString = jsonArray.getJsonObject(i).getString("eta");
                    JsonObject etaFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("eta",etaFormat);
                }


                // JsonArray cleanedArray = JsonCleaner.cleanJsonArray(jsonArray);


                context.response()
                .setStatusCode(200)
                .setStatusMessage("ok")
                .end(jsonArray.toString());
            }else{
                context.response()
                .setStatusCode(500)
                .end("database error");
            }
        });
    }
    
    private void getChildTasks(RoutingContext context){
        HttpMethod method = context.request().method();
        System.out.println("HTTP method is "+ method);

        String path = context.request().path();
        String extractedPath = path.replaceFirst("^/master/task/", ""); 
        // System.out.println(extractedPath); 
        
        String query = "select * from tasks where parent_id = " + '"' + extractedPath + '"' +";";

        client.query(query,res->{
            if(res.succeeded()){
                JsonArray jsonArray = new JsonArray(res.result().getRows().toString());
                // System.out.println(jsonArray);
               
                for(int i=0;i<jsonArray.size();i++){
                    //======== output =======//
                    // JsonObject jsonObject = jsonArray.getJsonObject(i);
                    String outputFormatString = jsonArray.getJsonObject(i).getString("output_format");
                    JsonObject outputFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("output_format",outputFormat);

                    //======== input =======//
                    outputFormatString = jsonArray.getJsonObject(i).getString("input_format");
                    JsonObject inputFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("input_format",inputFormat);


                    //======== eta =======//
                    outputFormatString = jsonArray.getJsonObject(i).getString("eta");
                    JsonObject etaFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("eta",etaFormat);
                }

                context.response()
                .setStatusCode(200)
                .setStatusMessage("ok")
                .end(jsonArray.toString());
            }else{
                context.response()
                .setStatusCode(500)
                .end("database error getChild");
            }
        });
    }
    
    private void updateTask(RoutingContext context){
        HttpMethod method = context.request().method();
        System.out.println("HTTP method is "+ method);

        context.request().bodyHandler(res->{
            String cntRcvd = res.toString();
            String path = context.request().path();
            String extractedPath = path.replaceFirst("^/task/", "");

            JsonObject jsonObject = new JsonObject(cntRcvd);
            System.out.println((new JsonObject(jsonObject.getString("output_format"))).toString());

            String query = "update tasks set "+
                           "name = " + "'" + jsonObject.getString("name")+ "',"+
                           "slug = " + "'" +jsonObject.getString("slug")+ "'," +
                           "description =" + "'" +jsonObject.getString("description")+"',"+
                           "help_text =" + "'" +jsonObject.getString("help_text")+"',"+
                           "input_format ="+"'" + (new JsonObject(jsonObject.getString("input_format"))).toString()+"',"+
                           "output_format ="+"'" + (new JsonObject(jsonObject.getString("output_format"))).toString()+"',"+
                           "dependent_task_slug ="+"'" +jsonObject.getString("dependent_task_slug")+"',"+
                           "repeats_on ="+jsonObject.getString("repeats_on")+","+
                           "bulk_input ="+jsonObject.getString("bulk_input")+","+
                           "input_http_method ="+jsonObject.getString("input_http_method")+","+
                           "api_endpoint ="+"'" +jsonObject.getString("api_endpoint")+"',"+
                           "api_timeout_in_ms ="+jsonObject.getString("api_timeout_in_ms")+","+
                           "response_type ="+jsonObject.getString("response_type")+","+
                           "is_json_input_needed ="+jsonObject.getString("is_json_input_needed")+","+
                           "task_type ="+jsonObject.getString("task_type")+","+
                           "is_active ="+jsonObject.getString("is_active")+","+
                           "is_optional ="+jsonObject.getString("is_optional")+","+
                           "eta ="+"'" + (new JsonObject(jsonObject.getString("eta"))).toString()+"'"+","+
                           "service_id ="+jsonObject.getString("service_id")+","+
                           "email_list ="+"'" +jsonObject.getString("email_list")+"',"+
                           "action ="+"'" +jsonObject.getString("action") + "'"+
                           " where id = " + extractedPath;


            client.query(query,resp->{
                if(resp.succeeded()){
                    context.response()
                    .setStatusCode(200)
                    .setStatusMessage("ok")
                    .end("data updated");
                }else{
                    context.response()
                    .setStatusCode(500)
                    .end("database error");
                }
            });

            // System.out.println(query);

            // context.response().end(query);
        });
    }

    private void postMaster(RoutingContext context){
        HttpMethod method = context.request().method();
        System.out.println("HTTP method is "+ method);

        context.request().bodyHandler(res->{
            String cntRcvd = res.toString();

            JsonObject jsonObject = new JsonObject(cntRcvd);


            String query = "insert into masterTasks ("+
                                "name,slug,description,help_text,"+
                                "input_format,output_format,dependent_task_slug,repeats_on,"+
                                "bulk_input,input_http_method,api_endpoint,api_timeout_in_ms,"+
                                "response_type,is_json_input_needed,task_type,is_active,is_optional,"+
                                "eta,service_id,email_list,action)"+"values("+
                                "'" + jsonObject.getString("name")+ "'"+ ","+
                                "'" +jsonObject.getString("slug")+ "'"+","+
                                "'" +jsonObject.getString("description")+"'"+","+
                                "'" +jsonObject.getString("help_text")+"'"+","+
                                "'" + jsonObject.getJsonObject("input_format") +"'"+","+
                                "'" + jsonObject.getJsonObject("output_format")+"'"+","+
                                "'" +jsonObject.getString("dependent_task_slug")+"'"+","+
                                jsonObject.getString("repeats_on")+","+
                                jsonObject.getString("bulk_input")+","+
                                jsonObject.getString("input_http_method")+","+
                                "'" +jsonObject.getString("api_endpoint")+"'"+","+
                                jsonObject.getString("api_timeout_in_ms")+","+
                                jsonObject.getString("response_type")+","+
                                jsonObject.getString("is_json_input_needed")+","+
                                jsonObject.getString("task_type")+","+
                                jsonObject.getString("is_active")+","+
                                jsonObject.getString("is_optional")+","+
                                "'" +jsonObject.getJsonObject("eta")+"'"+","+
                                jsonObject.getString("service_id")+","+
                                "'" +jsonObject.getString("email_list")+"'"+","+
                                "'" +jsonObject.getString("action") + "')" + ";";   

            // System.out.println(query);                    
            
            client.query(query,resp->{
                if(resp.succeeded()){
                    context.response()
                    .setStatusCode(200)
                    .setStatusMessage("ok")
                    .end("data added");
                }else{
                    context.response()
                    .setStatusCode(500)
                    .end("Could not add to the database");
                }
            });
        //    JsonObject obj = new JsonObject(jsonObject.getString("output_format"));
            // System.out.println(obj);
            // context.response().end(query);
        });
    }

    private void getTask(RoutingContext context){
        HttpMethod method = context.request().method();
        System.out.println("HTTP method is "+ method);

        String path = context.request().path();
        String extractedPath = path.replaceFirst("^/task/", ""); 
        // System.out.println(extractedPath); 
        
        String query = "select * from tasks where id = " + '"' + extractedPath + '"' +";";

        client.query(query,res->{
            if(res.succeeded()){
                JsonArray jsonArray = new JsonArray(res.result().getRows().toString());
                // System.out.println(jsonArray);
               
                for(int i=0;i<jsonArray.size();i++){
                    //======== output =======//
                    // JsonObject jsonObject = jsonArray.getJsonObject(i);
                    String outputFormatString = jsonArray.getJsonObject(i).getString("output_format");
                    JsonObject outputFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("output_format",outputFormat);

                    //======== input =======//
                    outputFormatString = jsonArray.getJsonObject(i).getString("input_format");
                    JsonObject inputFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("input_format",inputFormat);


                    //======== eta =======//
                    outputFormatString = jsonArray.getJsonObject(i).getString("eta");
                    JsonObject etaFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("eta",etaFormat);
                }

                context.response()
                .setStatusCode(200)
                .setStatusMessage("ok")
                .end(jsonArray.toString());
            }else{
                context.response()
                .setStatusCode(500)
                .end("database error ");
            }
        });

        // context.response().end(query);
    }

    private void postTask(RoutingContext context){
        HttpMethod method = context.request().method();
        System.out.println("HTTP method is "+ method);

        context.request().bodyHandler(res->{
            String cntRcvd = res.toString();

            JsonObject jsonObject = new JsonObject(cntRcvd);
            
            System.out.println(res);

            // System.out.println(jsonObject);

            String query = "insert into tasks ("+
                                "name,slug,description,help_text,"+
                                "input_format,output_format,dependent_task_slug,repeats_on,"+
                                "bulk_input,input_http_method,api_endpoint,api_timeout_in_ms,"+
                                "response_type,is_json_input_needed,task_type,is_active,is_optional,"+
                                "eta,service_id,email_list,action,parent_id)"+"values("+
                                "'" + jsonObject.getString("name")+ "'"+ ","+
                                "'" +jsonObject.getString("slug")+ "'"+","+
                                "'" +jsonObject.getString("description")+"'"+","+
                                "'" +jsonObject.getString("help_text")+"'"+","+
                                "'" + jsonObject.getJsonObject("input_format") +"'"+","+
                                "'" + jsonObject.getJsonObject("output_format")+"'"+","+
                                "'" +jsonObject.getString("dependent_task_slug")+"'"+","+
                                jsonObject.getString("repeats_on")+","+
                                jsonObject.getString("bulk_input")+","+
                                jsonObject.getString("input_http_method")+","+
                                "'" +jsonObject.getString("api_endpoint")+"'"+","+
                                jsonObject.getString("api_timeout_in_ms")+","+
                                jsonObject.getString("response_type")+","+
                                jsonObject.getString("is_json_input_needed")+","+
                                jsonObject.getString("task_type")+","+
                                jsonObject.getString("is_active")+","+
                                jsonObject.getString("is_optional")+","+
                                "'" +jsonObject.getJsonObject("eta")+"'"+","+
                                jsonObject.getString("service_id")+","+
                                "'" +jsonObject.getString("email_list")+"'"+","+
                                "'" +jsonObject.getString("action")+ "'" + ","
                                +jsonObject.getString("parent_id") + ");";   

            System.out.println();                    
            
            client.query(query,resp->{
                if(resp.succeeded()){
                    context.response()
                    .setStatusCode(200)
                    .setStatusMessage("ok")
                    .end("data added");
                }else{
                    context.response()
                    .setStatusCode(500)
                    .end("Could not add to the database");
                }
            });
        //    JsonObject obj = new JsonObject(jsonObject.getString("output_format"));
            // System.out.println(obj);
            // context.response().end(res);
        });
    }

    private void getMasters(RoutingContext context){
        HttpMethod method = context.request().method();
        System.out.println("HTTP method is "+ method);

        String path = context.request().path();

        String query = "select * from masterTasks;";

        client.query(query,res->{
            if(res.succeeded()){
                System.out.println("after succeed");
                // System.out.println();

                JsonArray jsonArray = new JsonArray(res.result().getRows().toString());
                // System.out.println(jsonArray);
               
                for(int i=0;i<jsonArray.size();i++){
                    //======== output =======//
                    // JsonObject jsonObject = jsonArray.getJsonObject(i);
                    String outputFormatString = jsonArray.getJsonObject(i).getString("output_format");
                    JsonObject outputFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("output_format",outputFormat);

                    //======== input =======//
                    outputFormatString = jsonArray.getJsonObject(i).getString("input_format");
                    JsonObject inputFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("input_format",inputFormat);


                    //======== eta =======//
                    outputFormatString = jsonArray.getJsonObject(i).getString("eta");
                    JsonObject etaFormat = new JsonObject(outputFormatString);
                    jsonArray.getJsonObject(i).put("eta",etaFormat);
                }


                // JsonArray cleanedArray = JsonCleaner.cleanJsonArray(jsonArray);


                context.response()
                .setStatusCode(200)
                .setStatusMessage("ok")
                .end(jsonArray.toString());
            }else{
                context.response()
                .setStatusCode(500)
                .end("database error");
            }
        });
    }

    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        vertx.deployVerticle(new App());
    }
}
