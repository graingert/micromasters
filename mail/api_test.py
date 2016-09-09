"""
Test cases for email API
"""
from unittest.mock import patch
from django.test import TestCase, override_settings
from django.conf import settings

from mail.api import MailgunClient


@patch('requests.post')  # pylint: disable=missing-docstring
class MailAPITests(TestCase):
    @override_settings(MAILGUN_FROM_EMAIL='mailgun_from_email@example.com')
    def test_from_address(self, mock_post):  # pylint: disable=no-self-use
        """
        Test that the 'from' address for our emails is set correctly
        """
        # NOTE: Using patch.multiple to override settings values because Django's
        # override_settings decorator fails to work for mysterious reasons
        MailgunClient.send_bcc('email subject', 'email body')
        _, called_kwargs = mock_post.call_args
        assert called_kwargs['data']['from'] == 'mailgun_from_email@example.com'

    def test_send_bcc(self, mock_post):  # pylint: disable=no-self-use
        """
        Test that MailgunClient.send_bcc sends expected parameters to the Mailgun API
        """
        MailgunClient.send_bcc('email subject', 'email body', 'a@example.com,b@example.com')
        assert mock_post.called
        called_args, called_kwargs = mock_post.call_args
        assert list(called_args)[0] == '{}/{}'.format(settings.MAILGUN_URL, 'messages')
        assert called_kwargs['auth'] == ('api', settings.MAILGUN_KEY)
        assert called_kwargs['data']['text'].startswith('email body')
        assert called_kwargs['data']['subject'] == 'email subject'
        assert called_kwargs['data']['to'] == settings.MAILGUN_BCC_TO_EMAIL

    @override_settings(MAILGUN_RECIPIENT_OVERRIDE='override@example.com')
    def test_email_override(self, mock_post):  # pylint: disable=no-self-use
        """
        Test that an email override value will be used over recipients specified
        in MailgunClient.send_bcc
        """
        MailgunClient.send_bcc('email subject', 'email body', 'a@example.com,b@example.com')
        _, called_kwargs = mock_post.call_args
        assert called_kwargs['data']['bcc'] == 'override@example.com'

    @override_settings(MAILGUN_RECIPIENT_OVERRIDE=None)
    def test_no_email_override(self, mock_post):  # pylint: disable=no-self-use
        """
        Test that recipients passed to MailgunClient.send_bcc will be used when no email
        override exists
        """
        MailgunClient.send_bcc('email subject', 'email body', 'a@example.com,b@example.com')
        _, called_kwargs = mock_post.call_args
        assert called_kwargs['data']['bcc'] == 'a@example.com,b@example.com'
