FILES_C=$(shell find . -name "*.c")
FILES_O=$(patsubst %.c,%.o,$(FILES_C))
DATE=$(shell date '+%B')

strange_app: $(DATE).o strange_app.o
	gcc strange_app.o $(DATE).o -o strange_app


%.o: %.c
	gcc -c $< -o $@
