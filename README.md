### Examples

```
const markdown = require("markup-tools/markdown"),
      sbml = require("markup-tools/sbml");
      
var markdown_text = ".....";
var sbml_text = sbml.generate_from_markdown(markdown.parse(markdown_text));

...
```

### Supported Syntax

#### Heading

```
    # This is a level 1 heading
    
    ## This is a level 2 heading
    
    ### This is a level 3 heading
    
    #### This is a level 4 heading
    
    ##### This is a level 5 heading

    ###### This is a level 6 heading
```

#### Block Quote

```
    > This is a single line quote.
```

```
    > This is a quote
    > that spans multiple lines
    > ...
```

#### List

```
    * Item one
    * Item two
    * Item three
```

```
    + First item
    + Second item with a longer description
      that spans multiple lines.
```

```
    1. First numbered item
       with additional details.
    2. Second numbered item
       that also spans multiple lines
       for further explanation.
```

#### Table

* Normal

```
    Header 1 | Header 2 | Header 3
    -------- | -------- | --------
    Data 1   | Data 2   | Data 3
    Data 4   | Data 5   | Data 6
```

* Center Align

```
    | Name    | Age | Location    |
    | :-----: | :-: | :---------: |
    | Alice   | 30  | Wonderland  |
    | Bob     | 25  | Builderland |
    | Charlie | 35  | Chocolate   |
```

* Left Align

```
    | Product  | Price | Stock  |
    | :------- | ----- | ------ |
    | Apples   | $1.00 | 100    |
    | Bananas  | $0.50 | 150    |
    | Cherries | $2.00 | 50     |
```

* Right Align

```
    | Date       | Sales | Profit |
    | ----------:| -----:| ------:|
    | 2021-07-28 | $1000 | $200   |
    | 2021-07-29 | $1500 | $300   |
    | 2021-07-30 | $2000 | $400   |
```

#### Image

```
    ![Cat](https://example.com/cat.jpg)
```

#### Link

```
    [OpenAI](https://openai.com)
```

#### Code Block

```
    ```
    Code ...
    ```
```

```
    ~~~
    Code ...
    ~~~
```

#### Inline Code

```
    This is a `code` snippet
```


#### Text Formatting

* Bold

```
    _bold_
    *bold*
```

* Italic

```
    __italic__
    **italic**
```

* Bold Italic

```
    ___bold italic___
    ***bold italic***
```


* Linethrough

```
    ~~linethroug~~
```

#### HTML

* Anchor

```
    <a href='https://example.com' target="_blank">Visit Example</a>
```

* Image

```
    <img src='https://example.com/image.png' alt="Example Image" width="500">
```

* IFrame

```
    <iframe src="https://example.com"></iframe>
```

* Bold

```
    <strong>This is bold text</strong>
    <b>This is bold text</b>
```

* Italic

```
    <i>This is italic text</i>
```

* Strike

```
    <strike>This text has a strikethrough</strike>
```

* Code

```
    <code>print('Hello, world!')</code>
```

* Subscript

```
    <sub>Subscript text</sub>
```

* Superscript

```
    <sup>Superscript text</sup>
```

* Heading

```
    <h1>This is a level 1 heading</h1>
    
    <h2>This is a level 2 heading</h2>
    
    <h3>This is a level 3 heading</h3>
    
    <h4>This is a level 4 heading</h4>
    
    <h5>This is a level 5 heading</h5>

    <h6>This is a level 6 heading</h6>
```

* Paragraph

```
    <p>
        ...
    </p>
```

* Division

```
    <div>
        ...
    </div>
```

* Block Quote

```
    <blockquote>
        ...
    </blockquote>
```

* Code Block

```
    <pre>
        Code
    </pre>
```

* Center Align

```
    <center>This is a text to align center</center>
```

* Line Break

```
    <br>
    <br />
```
