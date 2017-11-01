import sys, json

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    lines = read_in()

   
    print('D:/mantu/node_py/predictions_new.csv')

# Start process
if __name__ == '__main__':
    main()
