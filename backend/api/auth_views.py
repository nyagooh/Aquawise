import re
import secrets

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserProfile, ApiKey


# ── Register ──────────────────────────────────────────────────────────────────

@api_view(['POST'])
def register(request):
    data = request.data
    first_name = data.get('firstName', '').strip()
    last_name = data.get('lastName', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    organization = data.get('organization', '').strip()

    if not all([first_name, last_name, email, password]):
        return Response(
            {'error': 'firstName, lastName, email, and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'A user with this email already exists.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    UserProfile.objects.create(user=user, organization=organization)

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': _user_data(user),
        },
        status=status.HTTP_201_CREATED,
    )


# ── Login ─────────────────────────────────────────────────────────────────────

@api_view(['POST'])
def login(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'error': 'email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': _user_data(user),
    })


# ── Logout ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'error': 'refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        RefreshToken(refresh_token).blacklist()
    except TokenError:
        return Response(
            {'error': 'Invalid or already blacklisted token.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response({'detail': 'Logged out successfully.'})


# ── Me (GET / PUT) ────────────────────────────────────────────────────────────

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)

    if request.method == 'GET':
        return Response(_user_data(user))

    data = request.data
    if 'firstName' in data:
        user.first_name = data['firstName'].strip()
    if 'lastName' in data:
        user.last_name = data['lastName'].strip()
    if 'phone' in data:
        profile.phone = data['phone'].strip()
    if 'organization' in data:
        profile.organization = data['organization'].strip()
    if 'avatar' in data:
        profile.avatar = data['avatar'].strip()
    user.save()
    profile.save()
    return Response(_user_data(user))


# ── Change Password ───────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current = request.data.get('currentPassword', '')
    new_pw = request.data.get('newPassword', '')

    if not current or not new_pw:
        return Response(
            {'error': 'currentPassword and newPassword are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not user.check_password(current):
        return Response(
            {'error': 'Current password is incorrect.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(new_pw) < 8:
        return Response(
            {'error': 'New password must be at least 8 characters.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_pw)
    user.save()
    return Response({'detail': 'Password changed successfully.'})


# ── API Keys (GET / POST) ─────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_keys(request):
    user = request.user

    if request.method == 'GET':
        keys = ApiKey.objects.filter(user=user, is_active=True)
        return Response([_api_key_data(k) for k in keys])

    name = request.data.get('name', '').strip()
    if not name:
        return Response(
            {'error': 'name is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    key = ApiKey.objects.create(
        user=user,
        name=name,
        key=secrets.token_hex(32),
    )
    data = _api_key_data(key)
    data['key'] = key.key  # raw key only returned at creation
    return Response(data, status=status.HTTP_201_CREATED)


# ── Notifications (GET / PUT) ─────────────────────────────────────────────────

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def notifications(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        return Response(_notification_data(profile))

    data = request.data
    bool_fields = {
        'email': 'notification_email',
        'sms': 'notification_sms',
        'push': 'notification_push',
        'critical': 'notification_critical',
        'warning': 'notification_warning',
        'dailyDigest': 'notification_daily_digest',
    }
    for key, model_field in bool_fields.items():
        if key in data and isinstance(data[key], bool):
            setattr(profile, model_field, data[key])
    profile.save()
    return Response(_notification_data(profile))


# ── 2FA Enable ────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_2fa(request):
    import pyotp

    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if profile.two_fa_enabled:
        return Response(
            {'detail': '2FA is already enabled.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    secret = pyotp.random_base32()
    profile.two_fa_secret = secret
    profile.two_fa_enabled = True
    profile.save()

    provisioning_uri = pyotp.TOTP(secret).provisioning_uri(
        name=request.user.email,
        issuer_name='Aquawise',
    )
    return Response({
        'secret': secret,
        'provisioningUri': provisioning_uri,
        'detail': '2FA enabled. Scan the provisioning URI with your authenticator app.',
    })


# ── Helpers ───────────────────────────────────────────────────────────────────

def _user_data(user):
    profile = getattr(user, 'profile', None)
    return {
        'id': user.pk,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'email': user.email,
        'phone': profile.phone if profile else '',
        'organization': profile.organization if profile else '',
        'avatar': profile.avatar if profile else '',
        'twoFaEnabled': profile.two_fa_enabled if profile else False,
    }


def _api_key_data(key):
    return {
        'id': key.pk,
        'name': key.name,
        'createdAt': key.created_at.isoformat(),
        'lastUsed': key.last_used.isoformat() if key.last_used else None,
    }


def _notification_data(profile):
    return {
        'email': profile.notification_email,
        'sms': profile.notification_sms,
        'push': profile.notification_push,
        'critical': profile.notification_critical,
        'warning': profile.notification_warning,
        'dailyDigest': profile.notification_daily_digest,
    }
