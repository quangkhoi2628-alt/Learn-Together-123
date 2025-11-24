import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const convertMarkdownToHTML = (text: string): string => {
  if (!text) return '';
  
  const katex = (window as any).katex;
  if (typeof katex === 'undefined') {
    console.warn('KaTeX not loaded yet. Rendering math as plain text.');
    return text.replace(/\n/g, '<br />');
  }

  const mathPlaceholders = new Map<string, string>();
  let placeholderIndex = 0;
  
  // Process display math first ($$ ... $$) to handle multi-line blocks correctly
  let processedText = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
      try {
          const renderedMath = katex.renderToString(latex.trim(), { displayMode: true, throwOnError: false });
          const placeholder = `__MATH_PLACEHOLDER_${placeholderIndex++}__`;
          mathPlaceholders.set(placeholder, renderedMath);
          return placeholder;
      } catch (e) {
          console.error('KaTeX display math rendering error:', e);
          return match;
      }
  });

  // Then process inline math ($ ... $), ensuring it doesn't match across newlines or other dollar signs
  processedText = processedText.replace(/\$([^\n\$]+?)\$/g, (match, latex) => {
      try {
          const renderedMath = katex.renderToString(latex.trim(), { displayMode: false, throwOnError: false });
          const placeholder = `__MATH_PLACEHOLDER_${placeholderIndex++}__`;
          mathPlaceholders.set(placeholder, renderedMath);
          return placeholder;
      } catch (e) {
          console.error('KaTeX inline math rendering error:', e);
          return match;
      }
  });

  let html = processedText
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>');

  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  const newLines = [];
  let inListType: 'ul' | 'ol' | null = null;

  for (const line of lines) {
    if (line.trim().match(/^<h[1-3]>/)) {
      if (inListType) {
        newLines.push(`</${inListType}>`);
        inListType = null;
      }
      newLines.push(line);
      continue;
    }
      
    const isUl = /^\s*[-*] /.test(line);
    const isOl = /^\s*\d+\. /.test(line);

    if (isUl) {
      if (inListType !== 'ul') {
        if (inListType) newLines.push(`</${inListType}>`);
        newLines.push('<ul class="list-disc list-inside space-y-1 my-2">');
        inListType = 'ul';
      }
      newLines.push(`<li>${line.replace(/^\s*[-*] /, '')}</li>`);
    } else if (isOl) {
      if (inListType !== 'ol') {
        if (inListType) newLines.push(`</${inListType}>`);
        newLines.push('<ol class="list-decimal list-inside space-y-1 my-2">');
        inListType = 'ol';
      }
      newLines.push(`<li>${line.replace(/^\s*\d+\. /, '')}</li>`);
    } else {
      if (inListType) {
        newLines.push(`</${inListType}>`);
        inListType = null;
      }
      newLines.push(line);
    }
  }

  if (inListType) {
    newLines.push(`</${inListType}>`);
  }
  
  html = newLines.join('\n');
  html = html.split('\n\n').map(paragraph => {
    const trimmedP = paragraph.trim();
    if (trimmedP.startsWith('<ul') || trimmedP.startsWith('<ol') || trimmedP.startsWith('<h')) {
      return paragraph;
    }
    return paragraph ? `<p class="mb-3">${paragraph.replace(/\n/g, '<br />')}</p>` : '';
  }).join('');
  
  html = html.replace(/\n/g, '');

  mathPlaceholders.forEach((mathHtml, placeholder) => {
      const regex = new RegExp(placeholder, 'g');
      html = html.replace(regex, mathHtml);
  });

  return html;
};


export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const htmlContent = convertMarkdownToHTML(content);

  return (
    <div
      className="prose max-w-none text-gray-800 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};