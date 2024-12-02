function doGet() {
  var htmlContent = exportarDocumento("HTML"); // Chama a função para gerar HTML
  return HtmlService.createHtmlOutput(htmlContent);
}

function exportarDocumento(formato) {
  // Inserir id do documento 
  // Padrão do docs: https://docs.google.com/document/d/documentId/)
  var documentoId = ''; 
  var documento = DocumentApp.openById(documentoId);
  var corpo = documento.getBody();
  var elementos = corpo.getParagraphs();

  var conteudo = '';

  for (var i = 0; i < elementos.length; i++) {
    var elemento = elementos[i];
    conteudo += processarElemento(elemento, formato);
  }

  if (formato === "HTML") {
    return '<html><head><title>Documento Exportado</title></head><body>' + conteudo + '</body></html>';
  } else if (formato === "SQL") {
    return conteudo;
  }
}


function processarElemento(elemento, formato) {
  var tipoElemento = elemento.getType();
  var conteudo = '';

  if (tipoElemento === DocumentApp.ElementType.PARAGRAPH) {
    var paragrafo = elemento.asParagraph();
    conteudo = (formato === "HTML") 
      ? '<p style="' + getEstilosParagrafo(paragrafo) + '">' + getTextoComEstilo(paragrafo, formato) + '</p>' 
      : getTextoComEstilo(paragrafo, formato) + '\n'; 
  } else if (tipoElemento === DocumentApp.ElementType.TABLE) {
    var tabela = elemento.asTable();
    conteudo = (formato === "HTML") 
      ? processarTabelaHTML(tabela) 
      : processarTabelaSQL(tabela);
  } else if (tipoElemento === DocumentApp.ElementType.INLINE_IMAGE) {
    var imagem = elemento.asInlineImage();
    conteudo = (formato === "HTML") 
      ? processarImagemHTML(imagem) 
      : processarImagemSQL(imagem);
  } 
  // ... outros tipos de elementos

  return conteudo;
}

function getTextoComEstilo(paragrafo, formato) {
  var texto = '';
  var numElements = paragrafo.getNumChildren();

  for (var j = 0; j < numElements; j++) {
    var elemento = paragrafo.getChild(j);
    
    if (elemento.getType() === DocumentApp.ElementType.TEXT) {
      var textElement = elemento.asText();
      if (textElement) { // Verifica se textElement não é null ou undefined
        texto += processarTextoComEstilos(textElement, formato);
      } else {
        Logger.log('Elemento de texto é nulo ou indefinido.');
      }
    } else if (elemento.getType() === DocumentApp.ElementType.INLINE_IMAGE) {
      if (formato === "HTML") {
        var imagem = elemento.asInlineImage();
        texto += processarImagemHTML(imagem);
      }
    } else if (elemento.getType() === DocumentApp.ElementType.TABLE) {
      if (formato === "HTML") {
        var tabela = elemento.asTable();
        texto += processarTabelaHTML(tabela);
      }
    } else {
      Logger.log('Tipo de elemento não tratado: ' + elemento.getType());
      // Aqui pode ser decidido o que fazer com outros tipos de elementos não tratados
    }
  }
  
  return texto;
}

function processarImagemHTML(imagem) {
  var blob = imagem.getBlob(); // Obtém o Blob da imagem
  var contentType = blob.getContentType(); // Obtém o tipo de conteúdo da imagem
  var bytes = blob.getBytes(); // Obtém os bytes da imagem
  var base64 = Utilities.base64Encode(bytes); // Converte os bytes para base64
  
  var imageUrl = "data:" + contentType + ";base64," + base64; // Cria a URL base64 da imagem
  
  // Obtém as dimensões da imagem para incluir no HTML
  var width = imagem.getWidth();
  var height = imagem.getHeight();
  
  // Cria a tag <img> com a URL base64 e as dimensões da imagem
  var html = '<img src="' + imageUrl + '" width="' + width + '" height="' + height + '" alt="Imagem">';
  
  return html;
}



function processarTextoComEstilos(textElement, formato) {
  var text = textElement.getText();
  var styledText = '';
  var length = text.length;

  for (var i = 0; i < length; i++) {
    var char = text.charAt(i);
    var attrs = textElement.getAttributes(i);

    // Verifica se attrs é null ou undefined para caracteres sem formatação específica
    if (attrs) {
      var style = '';

      if (attrs.BOLD) {
        style += 'font-weight: bold;';
      }
      if (attrs.ITALIC) {
        style += 'font-style: italic;';
      }
      if (attrs.UNDERLINE) {
        style += 'text-decoration: underline;';
      }
      if (attrs.STRIKETHROUGH) {
        style += 'text-decoration: line-through;';
      }
      /*
      if (attrs.SUPERSCRIPT) {
        style += 'vertical-align: super; font-size: smaller;';
      }
      if (attrs.SUBSCRIPT) {
        style += 'vertical-align: sub; font-size: smaller;';
      }*/

      if (formato === "HTML" && style !== '') {
        styledText += '<span style="' + style + '">' + char + '</span>';
      } else {
        styledText += char;
      }
    } else {
      styledText += char;
    }
  }

  return styledText;
}

function getEstilosParagrafo(paragrafo) {
  var estilos = '';
  var atributosParagrafo = paragrafo.getAttributes();

  if (atributosParagrafo.ALIGNMENT) {
    if (atributosParagrafo.ALIGNMENT === DocumentApp.HorizontalAlignment.CENTER) {
      estilos += 'text-align: center;';
    } else if (atributosParagrafo.ALIGNMENT === DocumentApp.HorizontalAlignment.RIGHT) {
      estilos += 'text-align: right;';
    } else {
      estilos += 'text-align: left;';
    }
  }
  return estilos;
}
