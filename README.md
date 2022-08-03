# pre-commit-md-plantuml-converter - 
> A markdown plantuml snippet to image converter pre-commit hook

<!-- toc -->

<!-- Regenerate with "pre-commit run -a markdown-toc" -->

<!-- tocstop -->

Generates images from plantuml snippets contained in a markdown file. 

The plantuml snippets can be defined as follows: 

~~~markdown
  # Ex 1: A collapsible section with markdown
   <details>
     <summary>Click to expand!</summary>
   
   ```plantuml
   @startuml
   Hasan -> Bob: 1. Esenlikler Bob cugum
   Bob --> Hasan: How are you
   Bob --> Alice: Hello Alice
   
   Alice -> Bob: Another authentication Request
   Alice <-- Bob: Another authentication Response
   @enduml
   ```
   </details>
   
   ![](output_1658728903534.png)
   
   
   # Ex 2: After existing collapsible
   
   ```plantuml
   @startuml
   if (color?) is (<color:red>red) then
   :print red;
   else
   :print not redtest;
   @enduml
   ```
   ![](.tmp/output_1658728903544.png)

   Lorem ipsum dolor.
   
   ## `Ex 3:` Without image reference
   ```plantuml
   @startuml
   start
   if (3. Graphviz installed?) then (yes)
     :process all\ndiagrams;
   else (no)
     :process only
     __sequence__ and __activity__ diagrams;
   endif
   stop
   @enduml
   ```
~~~

## Usage

You can define the hook in you `.pre-commit-config.yaml` file as follows: 

```yaml
repos:
  - repo: https://github.com/entrofi/pre-commit-md-plantuml-converter
    rev: v0.0.2
    hooks:
      - id:  md_plantuml_converter
        args: [--extension=png, --image-dir=./docs/assets/puml,  --prefix= ]
```
