import pandas as pd
import matplotlib.pyplot as plt

def plot_graph():
    first = pd.read_csv('first_run_no_azure/first_run_local_program_stats_history.csv')
    second = pd.read_csv('second_run_azure/second_run_with_azure_vmss_stats_history.csv')
    third = pd.read_csv('thrird_run_web_app/third_run_azure_web_app_stats_history.csv')
    fourth = pd.read_csv('fourth_run_azure_function/fourth_run_azure_function_stats_history.csv')
    print(first.columns)
    for count,row in enumerate(first.iterrows()):
        first.at[count, 'Timestamp'] = count * 180 / first.shape[0]
    for count,row in enumerate(second.iterrows()):
        second.at[count, 'Timestamp'] = count * 180 / second.shape[0]
    for count,row in enumerate(third.iterrows()):
        third.at[count, 'Timestamp'] = count * 180 / third.shape[0]
    for count,row in enumerate(fourth.iterrows()):
        fourth.at[count, 'Timestamp'] = count * 180 / fourth.shape[0]
    # Plotting the data on the same graph
    plt.figure(figsize=(10, 6))  # Adjust figure size if needed

    # Plotting each DataFrame on the same graph
    plt.plot(first['Timestamp'], first['Requests/s'], label='Local', marker='o')
    plt.plot(second['Timestamp'], second['Requests/s'], label='Azure VMSS', marker='o')
    plt.plot(third['Timestamp'], third['Requests/s'], label='Azure Web App', marker='o')
    plt.plot(fourth['Timestamp'], fourth['Requests/s'], label='Azure Function', marker='o')

    # Adding labels and title
    plt.xlabel('Timestamp')
    plt.ylabel('Requests/s')
    plt.title('Request/s over Time')

    # Showing legend
    plt.legend()

    # Displaying the plot
    plt.grid(True)
    plt.tight_layout()
    plt.savefig('graph.jpg')  # Save as 'graph.jpg'
    plt.show()

if __name__ == '__main__':
    plot_graph()
