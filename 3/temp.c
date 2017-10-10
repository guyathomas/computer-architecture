   #include <stdio.h>

int main()
{
    int c = getchar();
    while((c = getchar()) != EOF) {
      if (c == '\t'){
        printf("\\t");
      }
      if (c == '\b'){
        printf("\\b");  
      }
      if (c == '\\'){
        printf("\\");  
      }
    }
}