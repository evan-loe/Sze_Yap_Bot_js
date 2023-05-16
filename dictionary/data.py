import csv

class Dictionary:
    
  def __init__(self, filename) -> None:
    self.data = self.read_csv(filename)

  def read_csv(filename):
    data = []
    with open(filename) as csvfile:
      reader = csv.reader(csvfile, delimiter=',')
      for row in reader:
        # clean and process data
        data.append(row)
    return data
