using MBP.CE.Web.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Web;

namespace MBP.CE.Web.Services.Implementation
{
    public class ProxyService : IProxyService
    {
        public Models.ProxyResponseModel ExecuteMWRequest(string webServiceUrl, System.Net.Http.HttpMethod httpMethod, object data, string username, ResponseFormatEnum responseFormat = ResponseFormatEnum.Json)
        {
            string jsonMediaType = "application/json";
            ProxyResponseModel result = new ProxyResponseModel();
            try
            {
                HttpClientHandler handler = new HttpClientHandler()
                {
                    //Credentials = new NetworkCredential(ConfigurationManager.AppSettings["ServiceCredentialUsername"], ConfigurationManager.AppSettings["ServiceCredentialPassword"])
                    UseDefaultCredentials = true
                };
                using (HttpClient httpClient = new HttpClient(handler))
                {
                    httpClient.Timeout = new TimeSpan(0, 5, 0);
                    var userNameEncrypted = MBP.FRW.Security.Cryptography.Rijndael.Encrypt(username);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(jsonMediaType));
                    httpClient.DefaultRequestHeaders.Add("X-Api-Auth", userNameEncrypted);

                    HttpRequestMessage requestMsg = null;
                    if (httpMethod == HttpMethod.Get)
                    {
                        requestMsg = new HttpRequestMessage(httpMethod, webServiceUrl);
                    }
                    else
                    {
                        string postBody = ObjectToJson(data);
                        HttpContent content = new StringContent(postBody, Encoding.UTF8, jsonMediaType);
                        requestMsg = new HttpRequestMessage(httpMethod, webServiceUrl)
                        {
                            Content = content
                        };
                    }
                    HttpResponseMessage responseMessage = httpClient.SendAsync(requestMsg).Result;
                    var responseMessageContent = responseMessage.Content.ReadAsStringAsync().Result;
                    result.StatusCode = responseMessage.StatusCode;
                    if (responseMessage.StatusCode == HttpStatusCode.OK)
                    {
                        if (!string.IsNullOrEmpty(responseMessageContent))
                        {
                            dynamic obj = null;
                            if (responseFormat == ResponseFormatEnum.Json)
                            {
                                var token = JToken.Parse(responseMessageContent);
                                JsonReader reader = new JsonTextReader(new StringReader(responseMessageContent));
                                reader.DateParseHandling = DateParseHandling.None;
                                if (token is JArray)
                                {
                                    obj = JArray.Load(reader);
                                }
                                else if (token is JObject)
                                {
                                    obj = JObject.Load(reader);
                                }
                                if (obj == null)
                                {
                                    try
                                    {
                                        Guid guid;
                                        bool b;
                                        int i;
                                        var aux = System.Text.RegularExpressions.Regex.Replace(responseMessageContent, "[@,\\.\";'\\\\]", string.Empty);
                                        if (Guid.TryParse(aux, out guid))
                                        {
                                            result.ResponseData = guid;
                                        }
                                        else if (bool.TryParse(aux, out b))
                                        {
                                            result.ResponseData = b;
                                        }
                                        else if (int.TryParse(aux, out i))
                                        {
                                            result.ResponseData = i;
                                        }
                                        else
                                        {
                                            result.ResponseData = responseMessageContent;
                                        }
                                    }
                                    catch (Exception ex2)
                                    {
                                        result = ExceptionToProxyResponseModel(ex2, HttpStatusCode.InternalServerError);
                                    }
                                }
                                else
                                {
                                    result.ResponseData = obj;
                                }
                            }
                            else if (responseFormat == ResponseFormatEnum.Xml)
                            {
                                result.ResponseData = responseMessageContent;
                            }
                        }
                    }
                    else
                    {
                        result.ResponseData = responseMessageContent;
                    }
                }
            }
            catch (Exception ex)
            {
                result = ExceptionToProxyResponseModel(ex, HttpStatusCode.InternalServerError);
            }
            return result;
        }


        public HttpMethod HttpVerbsToHttpMethod(System.Web.Mvc.HttpVerbs verb)
        {
            switch (verb)
            {
                case System.Web.Mvc.HttpVerbs.Delete:
                    return HttpMethod.Delete;
                case System.Web.Mvc.HttpVerbs.Get:
                    return HttpMethod.Get;
                case System.Web.Mvc.HttpVerbs.Head:
                    return HttpMethod.Head;
                case System.Web.Mvc.HttpVerbs.Options:
                    return HttpMethod.Options;
                //case System.Web.Mvc.HttpVerbs.Patch:
                //    return HttpMethod...;
                case System.Web.Mvc.HttpVerbs.Post:
                    return HttpMethod.Post;
                case System.Web.Mvc.HttpVerbs.Put:
                    return HttpMethod.Put;
                default:
                    return HttpMethod.Get;
            }
        }


        private ProxyResponseModel ExceptionToProxyResponseModel(Exception ex, HttpStatusCode statusCode)
        {
            ProxyResponseModel result = new ProxyResponseModel();
            result.StatusCode = statusCode;
            result.ResponseData = ObjectToJson(ex);
            return result;
        }



        private TResponseData JsonToObject<TResponseData>(string responseMessageContent)
        {
            var jsonSerializer = new JsonSerializer();
            using (TextReader textReader = new StringReader(responseMessageContent))
            {
                using (JsonReader jsonReader = new JsonTextReader(textReader))
                {
                    return jsonSerializer.Deserialize<TResponseData>(jsonReader);
                }
            }
        }

        private object JsonToObject(string responseMessageContent, Type classType)
        {
            var jsonSerializer = new JsonSerializer();
            using (TextReader textReader = new StringReader(responseMessageContent))
            {
                using (JsonReader jsonReader = new JsonTextReader(textReader))
                {
                    return jsonSerializer.Deserialize(jsonReader, classType);
                }
            }
        }

        private string ObjectToJson<TObjectToSerialize>(TObjectToSerialize objectToSerialize)
        {
            var json = new JsonSerializer();
            json.DateFormatHandling = DateFormatHandling.MicrosoftDateFormat;
            json.ContractResolver = new CamelCasePropertyNamesContractResolver();
            var textWriter = new StringWriter();
            json.Serialize(textWriter, objectToSerialize);
            return textWriter.ToString();
        }

    }
}