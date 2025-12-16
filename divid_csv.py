import pandas as pd

class CSVDivider:
    """
    A class to read a CSV file and divide it into 2 or 3 output CSV files.
    
    Usage:
    divider = CSVDivider('input.csv')
    df = divider.read()
    divider.write(num_parts=2, output_prefix='output_part')
    """
    
    def __init__(self, input_file: str):
        """
        Initialize with the input CSV file path.
        
        Args:
            input_file (str): Path to the input CSV file.
        """
        self.input_file = input_file
        self.df = None
    
    def read(self) -> pd.DataFrame:
        """
        Read the input CSV file into a pandas DataFrame.
        
        Returns:
            pd.DataFrame: The loaded DataFrame.
        """
        self.df = pd.read_csv(self.input_file)
        return self.df
    
    def write(self, num_parts: int = 2, output_prefix: str = 'output_part') -> None:
        """
        Divide the DataFrame into the specified number of parts (2 or 3) and write each to a separate CSV file.
        
        Args:
            num_parts (int): Number of parts to divide into (must be 2 or 3). Default is 2.
            output_prefix (str): Prefix for output file names (e.g., 'output_part_1.csv'). Default is 'output_part'.
        
        Raises:
            ValueError: If DataFrame is not loaded or num_parts is not 2 or 3.
        """
        if self.df is None:
            raise ValueError("Please call read() first to load the DataFrame.")
        
        if num_parts not in [2, 3]:
            raise ValueError("num_parts must be 2 or 3.")
        
        total_rows = len(self.df)
        rows_per_part = total_rows // num_parts
        
        for i in range(num_parts):
            start_idx = i * rows_per_part
            end_idx = (i + 1) * rows_per_part if i < num_parts - 1 else total_rows
            part_df = self.df.iloc[start_idx:end_idx]
            
            output_file = f"{output_prefix}_{i+1}.csv"
            part_df.to_csv(output_file, index=False)
            print(f"Wrote part {i+1} to {output_file} ({len(part_df)} rows)")
        
        print(f"Successfully divided input into {num_parts} parts.")
