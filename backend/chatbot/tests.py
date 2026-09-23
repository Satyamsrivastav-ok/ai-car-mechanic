import json
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Conversation, Message


class ChatbotApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_greeting_skips_gemini(self):
        with patch('chatbot.services.gemini._generate_content') as generate:
            response = self.client.post('/api/chat/', {'message': 'Hi'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('AI mechanic', response.data['assistant_response'])
        generate.assert_not_called()

    def test_unrelated_question_skips_gemini(self):
        with patch('chatbot.services.gemini._generate_content') as generate:
            response = self.client.post(
                '/api/chat/', {'message': 'What is the capital of France?'}, format='json'
            )
        self.assertEqual(response.status_code, 200)
        self.assertIn('vehicle diagnostics', response.data['assistant_response'])
        generate.assert_not_called()

    def test_automotive_message_reaches_gemini_with_exact_context(self):
        with patch(
            'chatbot.services.gemini._generate_content',
            return_value='A detached wheel is unsafe. Do not drive; arrange towing and inspection.',
        ) as generate:
            response = self.client.post(
                '/api/chat/',
                {'message': 'gadi k ek tyre hi nikal gaya'},
                format='json',
            )
        self.assertEqual(response.status_code, 200)
        self.assertIn('detached wheel', response.data['assistant_response'])
        prompt = generate.call_args.args[0][0]['text']
        self.assertIn('gadi k ek tyre hi nikal gaya', prompt)
        self.assertIn('primary reasoning engine', prompt)

    def test_follow_up_history_reaches_gemini_without_category_router(self):
        conversation = Conversation.objects.create()
        Message.objects.create(
            conversation=conversation,
            role=Message.ROLE_USER,
            content='meri car start nahi ho rahi',
        )
        Message.objects.create(
            conversation=conversation,
            role=Message.ROLE_ASSISTANT,
            content='Engine crank karta hai ya bilkul response nahi deta?',
        )
        with patch(
            'chatbot.services.gemini._generate_content',
            return_value='Dashboard lights aur clicking sound check karte hain.',
        ) as generate:
            response = self.client.post(
                '/api/chat/',
                {'conversation_id': conversation.id, 'message': 'haan'},
                format='json',
            )
        self.assertEqual(response.status_code, 200)
        prompt = generate.call_args.args[0][0]['text']
        self.assertIn('meri car start nahi ho rahi', prompt)
        self.assertIn('haan', prompt)

    def test_gemini_failure_returns_controlled_fallback(self):
        with patch(
            'chatbot.services.gemini._generate_content',
            side_effect=RuntimeError('temporary provider failure'),
        ):
            response = self.client.post(
                '/api/chat/', {'message': 'engine se knocking aa rahi hai'}, format='json'
            )
        self.assertEqual(response.status_code, 200)
        self.assertIn('unable to reach', response.data['assistant_response'].lower())
        self.assertNotIn('temporary provider failure', response.data['assistant_response'])

    def test_diagnosis_preserves_existing_response_shape(self):
        conversation = Conversation.objects.create()
        Message.objects.create(
            conversation=conversation,
            role=Message.ROLE_USER,
            content='The engine is knocking at idle.',
        )
        result = json.dumps({
            'problem_summary': 'Engine noise reported at idle.',
            'possible_causes': 'Oil pressure, valvetrain, or internal wear.',
            'most_likely_issue': 'A mechanical noise requiring inspection.',
            'recommended_service': 'Stop if the knock is deep and arrange inspection.',
            'urgency': 'high',
        })
        with patch('chatbot.services.gemini._generate_content', return_value=result):
            response = self.client.post(
                '/api/diagnosis/', {'conversation_id': conversation.id}, format='json'
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            set(response.data),
            {'problem_summary', 'possible_causes', 'most_likely_issue', 'recommended_service', 'urgency'},
        )
        self.assertEqual(response.data['urgency'], 'high')

    def test_image_is_passed_to_diagnosis_gemini(self):
        conversation = Conversation.objects.create()
        Message.objects.create(
            conversation=conversation,
            role=Message.ROLE_USER,
            content='Dashboard par red warning light aa rahi hai.',
        )
        upload = self.client.post(
            '/api/upload/',
            {
                'conversation_id': conversation.id,
                'media_type': 'image',
                'file': SimpleUploadedFile('dashboard.jpg', b'image-bytes', content_type='image/jpeg'),
            },
            format='multipart',
        )
        self.assertEqual(upload.status_code, 201)
        result = json.dumps({
            'problem_summary': 'Dashboard warning light visible.',
            'possible_causes': 'Several systems can trigger this light.',
            'most_likely_issue': 'Requires identification of the exact symbol.',
            'recommended_service': 'Inspect the warning system and scan codes.',
            'urgency': 'medium',
        })
        with patch('chatbot.services.gemini._generate_content', return_value=result) as generate:
            response = self.client.post(
                '/api/diagnosis/', {'conversation_id': conversation.id}, format='json'
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(generate.call_args.args[0]), 2)

    def test_booking_api_remains_available(self):
        conversation = Conversation.objects.create()
        response = self.client.post(
            '/api/booking/',
            {
                'conversation_id': conversation.id,
                'customer_name': 'Test Customer',
                'phone': '+91 9876543210',
                'vehicle_model': 'Honda City',
                'preferred_date': '2026-10-01',
                'preferred_time': '10:00:00',
                'issue_description': 'Wheel inspection required.',
            },
            format='json',
        )
        self.assertEqual(response.status_code, 201)
        detail = self.client.get(f"/api/booking/{response.data['id']}/")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data['phone'], '+91 9876543210')
