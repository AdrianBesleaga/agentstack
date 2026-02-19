from google.protobuf.json_format import MessageToDict
from a2a.types import Message, Part

if __name__ == "__main__":
    msg = Message(parts=[Part(text="hello")])
    print(MessageToDict(msg))
