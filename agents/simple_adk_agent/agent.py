from google.adk.agents import Agent

# Define a very simple agent
simple_agent = Agent(
    name="weather_time_agent",
    model="gemini-2.0-flash",
    description=(
        "Agent to answer questions about the time and weather in a city."
    ),
    instruction=(
        "You are a helpful agent who can answer user questions about the time and weather in a city."
    )
)

# To test this agent, you would typically run it with a message, for example:
# response = simple_agent.run("Hello there!")
# print(response)