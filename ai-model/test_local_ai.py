"""
Test script for Local Health AI Service
"""
import asyncio
import sys
sys.path.insert(0, '/Users/rohitmangalsinggothwal/Desktop/ProjectsCyber/agentic-healthcare-assistant/backend')

from app.services.local_health_ai_service import LocalHealthAIService

async def test_local_ai():
    print("🏥 Testing Local Health AI Service")
    print("=" * 50)
    
    # Initialize service
    ai = LocalHealthAIService()
    
    print(f"✅ Loaded {len(ai.knowledge_base)} conditions")
    print(f"✅ Indexed {len(ai.symptom_index)} symptoms")
    print()
    
    # Test 1: Analyze symptoms
    print("Test 1: Analyzing symptoms 'headache and fever'")
    result = await ai.analyze_symptoms("I have headache and fever")
    print(f"Found {len(result.get('possible_conditions', []))} possible conditions")
    for condition in result.get('possible_conditions', [])[:3]:
        print(f"  - {condition['condition']} (Urgency: {condition['urgency']})")
    print()
    
    # Test 2: Chat
    print("Test 2: Chat 'I have chest pain'")
    chat_result = await ai.chat("I have chest pain")
    print(f"Response type: {chat_result['type']}")
    print(f"Response preview: {chat_result['response'][:100]}...")
    print()
    
    # Test 3: Greeting
    print("Test 3: Chat 'hello'")
    greeting_result = await ai.chat("hello")
    print(f"Response: {greeting_result['response'][:100]}...")
    print()
    
    print("✅ All tests passed!")

if __name__ == "__main__":
    asyncio.run(test_local_ai())
