
package com.resumeanalyzer.service;

import java.io.IOException;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeParserService {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file)
            throws IOException, TikaException
    {

        try (var inputStream = file.getInputStream()) {
            return tika.parseToString(inputStream);
        }
    }
}
