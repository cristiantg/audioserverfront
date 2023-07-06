/**
 * audioserver
 * `Description`: audioserver (AS) is a state-of-the-art backend webservice for transcribing (decoding) audio files (multilingual) with automatic speech recognition (ASR) technology in real-time via standard https requests.<br><br>`Source code`: Please **cite** this [Github repository](https://github.com/cristiantg/audioserver) in case you are using audioserver for your research/work.<br><br>`Features`:<ol><li>Easy deployment and development </li><li>Flexible ASR infrastructure</li><li> Multilingual ASR</li><li>Very low latency</li><li>Unlimited parallel connections/requests</li><li>Full compatibility with any client-app/device (API REST)</li><li>API documentation: Swagger (standard protocol) </li><li>Easy communication between independent Docker containers </li><li>Tracing of users\"s audiofiles</li><li>Web logs</li><li>Security: https, JWT, bcrypt, register + email confirmation, possibility of removing audio files after recognition, login max. atempts, max. number of requests/user/minute, validation parameters, audio file type and lentgh limit.</li></ol>`Technologies`: RESTful web service with [Express.js](https://expressjs.com/), [Node.js](https://nodejs.org/) & [MongoDB](https://www.mongodb.com) & [Docker](https://www.docker.com/)  & [Kaldi](http://kaldi-asr.org/doc/index.html).<br><br>`Disclaimer`: The information contained in this Swagger-page is confidential, privileged and only for the information of the intended recipient and may not be used, published or redistributed without the prior written consent of CLST.
 *
 * OpenAPI spec version: 0.5
 * Contact: cristian.tejedorgarcia@ru.nl
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { LoginDTO } from './loginDTO';

export interface RegisterDTO extends LoginDTO { 
    email: string;
}